import { supabase } from './supabase'

export async function updateUserRelevance(id, value) {
  return supabase
    .from('intel_items')
    .update({
      user_relevance: value,
      user_relevance_at: value !== null ? new Date().toISOString() : null,
    })
    .eq('id', id)
}

export async function updateTags(id, newTags, oldTags) {
  await supabase
    .from('intel_items')
    .update({ tags: newTags })
    .eq('id', id)

  await supabase
    .from('intel_item_tag_history')
    .insert({ item_id: id, old_tags: oldTags, new_tags: newTags })
}

export async function markSlackShared(id) {
  return supabase
    .from('intel_items')
    .update({ slack_shared: true, slack_shared_at: new Date().toISOString() })
    .eq('id', id)
}
