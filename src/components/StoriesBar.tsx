import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import StoryViewer from './StoryViewer';
import StoryUploader from './StoryUploader';

interface Story {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  profile_id: string;
}

interface GroupedStories {
  profile: {
    id: string;
    name: string;
    media: {
      photos: string[];
    };
  };
  stories: Story[];
}

interface StoriesBarProps {
  isPremium?: boolean;
}

const StoriesBar: React.FC<StoriesBarProps> = ({ isPremium = false }) => {
  const [groupedStories, setGroupedStories] = useState<GroupedStories[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          media_url,
          media_type,
          created_at,
          profile_id,
          profile:profiles (
            id,
            name,
            media,
            is_hidden
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group stories by profile, excluding hidden profiles
      const grouped = (data || []).reduce<{ [key: string]: GroupedStories }>((acc, story) => {
        // Skip if profile is null or hidden
        if (!story.profile || story.profile.is_hidden) return acc;
        
        const profileId = story.profile.id;
        if (!acc[profileId]) {
          acc[profileId] = {
            profile: story.profile,
            stories: []
          };
        }
        acc[profileId].stories.push({
          id: story.id,
          media_url: story.media_url,
          media_type: story.media_type,
          created_at: story.created_at,
          profile_id: story.profile_id
        });
        return acc;
      }, {});

      setGroupedStories(Object.values(grouped));
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('A apărut o eroare la încărcarea story-urilor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();

    // Subscribe to story changes
    const subscription = supabase
      .channel('stories_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'stories' 
      }, () => {
        fetchStories();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleDeleteStory = async (storyId: string) => {
    try {
      // Delete the story from the database
      const { error: deleteError } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (deleteError) throw deleteError;

      // Refresh stories after deletion
      await fetchStories();
    } catch (err) {
      console.error('Error deleting story:', err);
      setError('A apărut o eroare la ștergerea story-ului');
    }
  };

  if (loading) {
    return (
      <div className="h-32 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Only show the stories bar if there are stories or the user is premium
  if (groupedStories.length === 0 && !isPremium) {
    return null;
  }

  return (
    <>
      <div className="h-32 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center h-full">
            <div className="flex space-x-6 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent w-full">
              {/* Story Upload Button - Only show for premium users */}
              {isPremium && (
                <div className="flex flex-col items-center justify-center space-y-2 flex-shrink-0">
                  <StoryUploader onUploadComplete={fetchStories} />
                  <span className="text-xs font-medium text-gray-600">
                    Adaugă Story
                  </span>
                </div>
              )}

              {/* Story Previews */}
              {groupedStories.map((group, index) => (
                <button
                  key={group.profile.id}
                  onClick={() => setSelectedGroupIndex(index)}
                  className="flex flex-col items-center space-y-2 flex-shrink-0 group"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-purple-500 to-pink-500">
                      <div className="w-full h-full rounded-full p-[2px] bg-white">
                        <img
                          src={group.profile.media.photos[0]}
                          alt={group.profile.name}
                          className="w-full h-full rounded-full object-cover transform transition-transform group-hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 truncate w-20 text-center">
                    {group.profile.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Story Viewer */}
      {selectedGroupIndex !== null && groupedStories[selectedGroupIndex]?.stories && (
        <StoryViewer
          stories={groupedStories[selectedGroupIndex].stories}
          currentIndex={0}
          onClose={() => setSelectedGroupIndex(null)}
          onNext={() => {
            const currentGroup = groupedStories[selectedGroupIndex];
            const currentStoryIndex = currentGroup.stories.length - 1;
            
            if (currentStoryIndex < currentGroup.stories.length - 1) {
              // Move to next story in current group
              return false;
            } else if (selectedGroupIndex < groupedStories.length - 1) {
              // Move to next group
              setSelectedGroupIndex(selectedGroupIndex + 1);
            } else {
              // Close viewer if we're at the end
              setSelectedGroupIndex(null);
            }
            return true;
          }}
          onPrevious={() => {
            const currentGroup = groupedStories[selectedGroupIndex];
            const currentStoryIndex = 0;
            
            if (currentStoryIndex > 0) {
              // Move to previous story in current group
              return false;
            } else if (selectedGroupIndex > 0) {
              // Move to previous group
              setSelectedGroupIndex(selectedGroupIndex - 1);
            }
            return true;
          }}
          onDelete={handleDeleteStory}
          canDelete={isPremium}
        />
      )}
    </>
  );
};

export default StoriesBar;