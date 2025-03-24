/**
 * Sitemap generator utility
 * Generates a sitemap.xml file for better SEO
 */

import { supabase } from '../lib/supabase';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export async function generateSitemap(baseUrl: string): Promise<string> {
  try {
    // Start XML document
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    const staticPages: SitemapUrl[] = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/login`, changefreq: 'monthly', priority: 0.3 },
      { loc: `${baseUrl}/register`, changefreq: 'monthly', priority: 0.3 },
      { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: 0.5 },
      { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: 0.2 },
      { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: 0.2 },
      { loc: `${baseUrl}/cookies`, changefreq: 'yearly', priority: 0.2 },
      { loc: `${baseUrl}/account-types`, changefreq: 'monthly', priority: 0.6 }
    ];
    
    // Add static pages to XML
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${page.loc}</loc>\n`;
      if (page.lastmod) xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      if (page.changefreq) xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      if (page.priority !== undefined) xml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
      xml += '  </url>\n';
    });
    
    // Fetch dynamic profile pages
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('is_hidden', false)
      .not('name', 'is', null)
      .not('city', 'is', null)
      .not('county', 'is', null);
    
    if (error) throw error;
    
    // Add dynamic profile pages to XML
    if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        const lastmod = profile.updated_at ? new Date(profile.updated_at).toISOString().split('T')[0] : undefined;
        
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/profile/${profile.id}</loc>\n`;
        if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      });
    }
    
    // Close XML document
    xml += '</urlset>';
    
    return xml;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

// Function to generate sitemap by county
export async function generateCountySitemaps(baseUrl: string): Promise<Map<string, string>> {
  try {
    // Fetch all counties with active profiles
    const { data: counties, error: countiesError } = await supabase
      .from('profiles')
      .select('county')
      .eq('is_hidden', false)
      .not('name', 'is', null)
      .not('city', 'is', null)
      .not('county', 'is', null);
    
    if (countiesError) throw countiesError;
    
    // Create a unique list of counties
    const uniqueCounties = [...new Set(counties?.map(p => p.county).filter(Boolean))];
    
    // Map to store county sitemaps
    const countySitemaps = new Map<string, string>();
    
    // Generate sitemap for each county
    for (const county of uniqueCounties) {
      // Fetch profiles for this county
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, updated_at')
        .eq('is_hidden', false)
        .eq('county', county)
        .not('name', 'is', null)
        .not('city', 'is', null);
      
      if (error) throw error;
      
      if (profiles && profiles.length > 0) {
        // Start XML document
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Add county index page
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/?county=${encodeURIComponent(county)}</loc>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.9</priority>\n';
        xml += '  </url>\n';
        
        // Add profile pages for this county
        profiles.forEach(profile => {
          const lastmod = profile.updated_at ? new Date(profile.updated_at).toISOString().split('T')[0] : undefined;
          
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/profile/${profile.id}</loc>\n`;
          if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += '    <changefreq>weekly</changefreq>\n';
          xml += '    <priority>0.8</priority>\n';
          xml += '  </url>\n';
        });
        
        // Close XML document
        xml += '</urlset>';
        
        // Store in map
        countySitemaps.set(county, xml);
      }
    }
    
    return countySitemaps;
  } catch (error) {
    console.error('Error generating county sitemaps:', error);
    throw error;
  }
}

// Function to generate sitemap index
export function generateSitemapIndex(baseUrl: string, counties: string[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add main sitemap
  xml += '  <sitemap>\n';
  xml += `    <loc>${baseUrl}/sitemap.xml</loc>\n`;
  xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  // Add county sitemaps
  counties.forEach(county => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/sitemaps/sitemap-${encodeURIComponent(county.toLowerCase())}.xml</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });
  
  xml += '</sitemapindex>';
  
  return xml;
}