import Image from 'next/image'

export default function Loader({ fullScreen = false }: { fullScreen?: boolean }) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Image 
        src="/logos/noxia_loader.gif" 
        alt="Chargement..." 
        width={150} 
        height={150} 
        priority 
        className="w-[150px] h-[150px] object-contain"
      />
      <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Chargement en cours...</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
        {content}
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[300px]">
      {content}
    </div>
  )
}
