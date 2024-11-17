import Image from "next/image";

export default function Home() {
  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/chameleon.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="opacity-30"
          priority
        />
      </div>
      {/* Text Overlay */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-center font-mono text-slate-100 text-4xl font-bold p-4">
          Expressing all things through multimedia with chameleon-like expressiveness
        </h1>
      </div>
    </div>
    
  );
}
