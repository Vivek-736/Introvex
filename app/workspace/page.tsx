import React from 'react';
import Chat from '@/components/Chat';

const WorkspacePage: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full bg-black">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 gap-10 max-w-5xl mx-auto">
        <div className="justify-center text-center space-x-2">
          <span className="text-white/85 text-4xl sm:text-5xl md:text-6xl font-normal font-['Instrument_Serif'] tracking-tight transition-all duration-300 hover:text-black/95 hover:drop-shadow-md">
            Effortless
          </span>
          <span className="text-white/85 text-4xl sm:text-5xl md:text-6xl font-normal italic font-['Instrument_Serif'] tracking-tight transition-all duration-300 hover:text-black/95 hover:drop-shadow-md">
            Research
          </span>
          <span className="text-white/85 text-4xl sm:text-5xl md:text-6xl font-normal font-['Instrument_Serif'] tracking-tight transition-all duration-300 hover:text-black/95 hover:drop-shadow-md">
            with Difras.
          </span>
        </div>
        <Chat />
      </div>
    </div>
  );
};

export default WorkspacePage;
