import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, ThumbsUp, Send, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Story {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  profile_id: string;
}

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onDelete?: (storyId: string) => void;
  canDelete?: boolean;
}

interface DeleteConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const reactions = [
  { type: 'like', icon: ThumbsUp, label: 'Like' },
  { type: 'heart', icon: Heart, label: 'Inimă' }
];

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmare Ștergere</h3>
      <p className="text-gray-600 mb-6">
        Ești sigur că vrei să ștergi acest story? Această acțiune nu poate fi anulată.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Anulează
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Șterge
        </button>
      </div>
    </div>
  </div>
);

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentIndex: initialIndex,
  onClose,
  onNext,
  onPrevious,
  onDelete,
  canDelete = false
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStoryOwner, setIsStoryOwner] = useState(false);
  const [viewRecorded, setViewRecorded] = useState<{[key: string]: boolean}>({});
  const { user } = useAuth();

  const currentStory = stories[currentStoryIndex];

  useEffect(() => {
    setCurrentStoryIndex(initialIndex);
    setProgress(0);
  }, [initialIndex]);

  // Check if the current user is the story owner
  useEffect(() => {
    const checkStoryOwnership = async () => {
      if (!user || !currentStory) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        setIsStoryOwner(profile?.id === currentStory.profile_id);
      } catch (err) {
        console.error('Error checking story ownership:', err);
        setIsStoryOwner(false);
      }
    };

    checkStoryOwnership();
  }, [user, currentStory]);

  const recordView = useCallback(async (storyId: string) => {
    // Skip if view already recorded for this story
    if (viewRecorded[storyId]) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          viewer_id: user?.id || null,
          viewed_at: new Date().toISOString()
        });

      if (error) {
        // Ignore duplicate key errors
        if (error.code !== '23505') {
          console.error('Error recording story view:', error);
        }
      }

      // Mark this story as viewed
      setViewRecorded(prev => ({ ...prev, [storyId]: true }));
    } catch (err) {
      console.error('Error recording story view:', err);
    }
  }, [viewRecorded]);

  useEffect(() => {
    if (!currentStory) return;
    recordView(currentStory.id);
  }, [currentStory?.id, recordView]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          onNext();
          return 0;
        }
        return prev + (100 / 50); // 5 seconds total duration (50 * 100ms)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, onNext]);

  const handleReaction = async (type: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('story_reactions')
        .upsert({
          story_id: currentStory.id,
          user_id: user.id,
          reaction_type: type
        }, {
          onConflict: 'story_id,user_id,reaction_type'
        });

      if (error) throw error;
      setSelectedReaction(type);
      setShowReactions(false);
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(currentStory.id);
      setShowDeleteConfirmation(false);
    } catch (err) {
      console.error('Error deleting story:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMouseDown = () => setIsPaused(true);
  const handleMouseUp = () => setIsPaused(false);
  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  const handlePrevious = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else {
      onPrevious();
    }
  }, [currentStoryIndex, onPrevious]);

  const handleNext = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onNext();
    }
  }, [currentStoryIndex, stories.length, onNext]);

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
        {stories.map((story, index) => (
          <div
            key={story.id}
            className="h-1 flex-1 bg-gray-800 overflow-hidden rounded-full"
          >
            <div
              className={`h-full bg-white transition-all duration-100 ease-linear ${
                index < currentStoryIndex
                  ? 'w-full'
                  : index === currentStoryIndex
                  ? ''
                  : 'w-0'
              }`}
              style={{
                width: index === currentStoryIndex ? `${progress}%` : undefined
              }}
            />
          </div>
        ))}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white z-10"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation Buttons */}
      {currentStoryIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white opacity-75 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {currentStoryIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white opacity-75 hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Story Content */}
      <div
        className="w-full h-full flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentStory.media_type === 'video' ? (
          <video
            src={currentStory.media_url}
            className="max-h-full max-w-full object-contain"
            autoPlay
            playsInline
            muted
            loop
          />
        ) : (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-0 right-0 px-6 flex items-center justify-between">
        {/* Reaction Button */}
        {user ? (
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 flex items-center space-x-2"
          >
            <Send className="h-5 w-5" />
            <span>Reacționează</span>
          </button>
        ) : (
          <div className="bg-white/5 text-gray-400 rounded-full px-4 py-2 flex items-center space-x-2 cursor-not-allowed">
            <Lock className="h-5 w-5" />
            <span>Conectează-te pentru a reacționa</span>
          </div>
        )}

        {/* Delete Button - Only show for story owner */}
        {isStoryOwner && canDelete && !isDeleting && (
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="bg-red-500/20 hover:bg-red-500/30 text-white rounded-full px-4 py-2 flex items-center space-x-2 transition-colors"
            title="Șterge story"
          >
            <Trash2 className="h-5 w-5" />
            <span>Șterge</span>
          </button>
        )}
      </div>

      {/* Reactions Panel */}
      {showReactions && user && (
        <div className="absolute bottom-24 left-6 bg-white rounded-full shadow-lg px-4 py-2 flex items-center space-x-4">
          {reactions.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className={`transform transition-transform hover:scale-125 ${
                selectedReaction === type ? 'scale-125 text-purple-500' : 'text-gray-700'
              }`}
              title={label}
            >
              <Icon className="h-6 w-6" />
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}
    </div>
  );
};

export default StoryViewer;