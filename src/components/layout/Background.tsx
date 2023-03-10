import useMachineStore from '../../store';

const Background = () => {
  const { openBurnForm } = useMachineStore();
  return (
    <div className={`
      scene-gradient        
      w-[85%] h-[55%] rounded-2xl absolute top-[32%] left-1/2 transform -translate-x-1/2 shadow-inner overflow-hidden 
      `}
    >
      {/* <video
        className={`${!openBurnForm ? 'animate-wow -mt-12' : 'mt-1'} w-full  shadow-lg border-b-1 z-20 border-black border-opacity-25 absolute`}
        id="alt-static"
        playsInline
        autoPlay
        muted
        loop
        src={`/assets/video/${openBurnForm ? 'fire.mp4' : 'scum.mp4'}`}
      /> */}
      {/* <div className="absolute h-full w-full machine-shadow z-10" /> */}
    </div>
  );
};

export default Background;
