import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ReviewSection() {
  const [reviews, setReviews] = useState([])
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  // Ambil daftar komentar & rating dari Supabase
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setReviews(data)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  // Kirim ulasan baru
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) return

    setLoading(true)
    const { error } = await supabase
      .from('reviews')
      .insert([{ name, rating: Number(rating), comment }])

    setLoading(false)
    if (!error) {
      setName('')
      setComment('')
      setRating(5)
      fetchReviews()
    } else {
      alert('Gagal mengirim ulasan: ' + error.message)
    }
  }

  // Hitung rata-rata rating
  const avgRating = reviews.length
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div style={{ marginTop: '30px', padding: '20px', borderTop: '1px solid #333' }}>
      <h2>Ulasan & Rating Pengguna</h2>
      <p>⭐ Rata-rata Rating: <strong>{avgRating} / 5</strong> ({reviews.length} ulasan)</p>

      {/* Form Tambah Ulasan */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="Nama Anda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '8px' }}
        />

        <label>
          Beri Bintang: 
          <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }}>
            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
            <option value="4">⭐⭐⭐⭐ (4)</option>
            <option value="3">⭐⭐⭐ (3)</option>
            <option value="2">⭐⭐ (2)</option>
            <option value="1">⭐ (1)</option>
          </select>
        </label>

        <textarea
          placeholder="Tulis ulasan/komentar..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="3"
          required
          style={{ padding: '8px' }}
        />

        <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Mengirim...' : 'Kirim Ulasan'}
        </button>
      </form>

      {/* Daftar Ulasan */}
      <div style={{ marginTop: '20px' }}>
        <h3>Daftar Komentar:</h3>
        {reviews.length === 0 ? (
          <p>Belum ada komentar.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ border: '1px solid #444', padding: '10px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{rev.name}</strong>
                  <span>{'⭐'.repeat(rev.rating)}</span>
                </div>
                <p style={{ margin: '5px 0' }}>{rev.comment}</p>
                <small style={{ color: '#888' }}>
                  {new Date(rev.created_at).toLocaleDateString('id-ID')}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
