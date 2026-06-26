import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { COMMUNITY_CATEGORIES } from '@mentesana/shared';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postCategory, setPostCategory] = useState('General');

  useEffect(() => { loadPosts(); }, [category]);

  const loadPosts = async () => {
    const data = await api.community.posts(category === 'all' ? undefined : category);
    setPosts(data);
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) { Alert.alert('Completa los campos'); return; }
    await api.community.create({ title, content, category: postCategory });
    setShowNew(false); setTitle(''); setContent('');
    loadPosts();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Comunidad</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowNew(!showNew)}>
          <Text style={styles.addButtonText}>{showNew ? 'Cancelar' : '+ Nuevo'}</Text>
        </TouchableOpacity>
      </View>

      {showNew && (
        <View style={styles.newPost}>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Título" />
          <TextInput style={styles.textArea} value={content} onChangeText={setContent} placeholder="Comparte tu experiencia..." multiline />
          <View style={styles.categoryRow}>
            {COMMUNITY_CATEGORIES.slice(0, 4).map(c => (
              <TouchableOpacity key={c} onPress={() => setPostCategory(c)}
                style={[styles.categoryChip, postCategory === c && styles.categoryChipActive]}>
                <Text style={[styles.categoryText, postCategory === c && styles.categoryTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
            <Text style={styles.submitButtonText}>Publicar anónimamente</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        <TouchableOpacity onPress={() => setCategory('all')}
          style={[styles.categoryChip, category === 'all' && styles.categoryChipActive]}>
          <Text style={[styles.categoryText, category === 'all' && styles.categoryTextActive]}>Todas</Text>
        </TouchableOpacity>
        {COMMUNITY_CATEGORIES.map(c => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)}
            style={[styles.categoryChip, category === c && styles.categoryChipActive]}>
            <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {posts.map((post: any) => (
        <TouchableOpacity key={post.id} style={styles.card} onPress={() => router.push(`/community/${post.id}`)}>
          <Text style={styles.cardTitle}>{post.title}</Text>
          <Text style={styles.cardContent} numberOfLines={2}>{post.content}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardCategory}>{post.category}</Text>
            <Text style={styles.cardAuthor}>{post.anonymousId}</Text>
            <Text style={styles.cardDate}>{new Date(post.createdAt).toLocaleDateString('es-ES')}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#6366f1', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  newPost: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 12 },
  textArea: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 14, minHeight: 80, marginBottom: 12, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 6 },
  categoryChipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  categoryText: { fontSize: 13, color: '#64748b' },
  categoryTextActive: { color: '#fff' },
  submitButton: { backgroundColor: '#6366f1', paddingVertical: 12, borderRadius: 12 },
  submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  categories: { marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardContent: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 12 },
  cardCategory: { fontSize: 11, backgroundColor: '#eef2ff', color: '#6366f1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  cardAuthor: { fontSize: 11, color: '#94a3b8' },
  cardDate: { fontSize: 11, color: '#94a3b8' },
});
