import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function VisitorCounter() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    const trackVisitor = async () => {
      // Cek apakah pengunjung sudah dihitung di sesi browser ini
      const hasVisited = sessionStorage.getItem('visited_session')

      if (!hasVisited) {
        // Panggil fungsi increment di Supabase
        await supabase.rpc('increment_visitor', { site_id: 'global' })
        sessionStorage.setItem('visited_session', 'true')
      }

      // Ambil angka pengunjung terbaru
      const { data } = await supabase
        .from('site_stats')
        .select('visitors_count')
        .eq('id', 'global')
        .single()

      if (data) {
        setCount(data.visitors_count)
      }
    }

    trackVisitor()
  }, [])

  return (
    <div style={{ padding: '10px 0', fontSize: '14px', color: '#888' }}>
      👁️ Total Pengunjung: <strong>{count !== null ? count : '...'}</strong>
    </div>
  )
}
