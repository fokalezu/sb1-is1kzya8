import { supabase } from './supabase';

// Function to apply the migration directly using the Supabase client
async function applyMigration() {
  try {
    console.log('Applying migration to fix promo codes RLS...');
    
    // Drop existing policies
    await supabase.rpc('drop_policy', { 
      policy_name: 'Public can view active promo codes',
      table_name: 'promo_codes'
    });
    
    await supabase.rpc('drop_policy', { 
      policy_name: 'Admins can manage promo codes',
      table_name: 'promo_codes'
    });
    
    await supabase.rpc('drop_policy', { 
      policy_name: 'Admins can insert promo codes',
      table_name: 'promo_codes'
    });
    
    await supabase.rpc('drop_policy', { 
      policy_name: 'Admins can update promo codes',
      table_name: 'promo_codes'
    });
    
    await supabase.rpc('drop_policy', { 
      policy_name: 'Admins can delete promo codes',
      table_name: 'promo_codes'
    });
    
    // Create new policies
    await supabase.rpc('create_policy', {
      policy_name: 'Public can view active promo codes',
      table_name: 'promo_codes',
      operation: 'SELECT',
      using_expr: 'is_active = true'
    });
    
    await supabase.rpc('create_policy', {
      policy_name: 'Admin insert promo codes',
      table_name: 'promo_codes',
      operation: 'INSERT',
      check_expr: "auth.jwt()->>'email' = 'madalincraciunica@gmail.com'"
    });
    
    await supabase.rpc('create_policy', {
      policy_name: 'Admin update promo codes',
      table_name: 'promo_codes',
      operation: 'UPDATE',
      using_expr: "auth.jwt()->>'email' = 'madalincraciunica@gmail.com'"
    });
    
    await supabase.rpc('create_policy', {
      policy_name: 'Admin delete promo codes',
      table_name: 'promo_codes',
      operation: 'DELETE',
      using_expr: "auth.jwt()->>'email' = 'madalincraciunica@gmail.com'"
    });
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

export default applyMigration;