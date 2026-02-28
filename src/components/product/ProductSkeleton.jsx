export default function ProductSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass" style={{ borderRadius: '20px', overflow: 'hidden', animationDelay: `${i * 0.05}s` }}>
          <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }} />
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="skeleton" style={{ height: '12px', width: '60%' }} />
            <div className="skeleton" style={{ height: '14px', width: '90%' }} />
            <div className="skeleton" style={{ height: '12px', width: '40%' }} />
            <div className="skeleton" style={{ height: '20px', width: '50%' }} />
          </div>
        </div>
      ))}
    </>
  )
}
