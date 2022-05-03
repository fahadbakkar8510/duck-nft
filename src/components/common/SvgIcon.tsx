
import { ReactNode, FC } from 'react';

interface SvgIconProps {  
  wrapperClassName?: string;
  className?: string;
}

export const BuyIcon: FC<SvgIconProps> = ({wrapperClassName = "", className = ""}) => {
  return (
    <div className={wrapperClassName}>
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 -0.5 19 22" shape-rendering="crispEdges">
        <path d="M4 1h3M12 1h3M3 2h1M7 2h1M11 2h1M15 2h1M4 3h2M8 3h3M13 3h2M5 4h3M11 4h3M6 5h7M5 6h1M12 6h2M6 7h7M5 8h1M7 8h7M4 9h1M6 9h3M10 9h5M3 10h1M5 10h2M12 10h4M2 11h1M4 11h2M7 11h2M10 11h2M13 11h4M2 12h1M4 12h2M7 12h2M10 12h7M1 13h1M3 13h4M10 13h8M1 14h1M3 14h6M12 14h6M1 15h1M3 15h6M10 15h2M13 15h5M1 16h5M7 16h2M10 16h2M13 16h3M17 16h1M1 17h6M12 17h4M17 17h1M2 18h7M10 18h5M16 18h1M3 19h9M15 19h1M4 20h11" />
      </svg>
    </div>
  ); 
}

export const ProfileIcon: FC<SvgIconProps> = ({wrapperClassName = "", className = ""}) => {
  return (
    <div className={wrapperClassName}>
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 -0.5 16 16" shape-rendering="crispEdges">
        <path d="M6 0h7M5 1h9M5 2h9M4 3h11M4 4h11M1 5h1M4 5h11M1 6h14M2 7h12M5 8h9M2 9h11M6 10h6M7 11h4M4 12h9M3 13h11M2 14h13M2 15h13" />
      </svg>
    </div>
  ); 
}

export const ProfileOpenIcon: FC<SvgIconProps> = ({wrapperClassName = "", className = ""}) => {
  return (
    <div className={wrapperClassName}>
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 16 16" shape-rendering="crispEdges">        
        <path d="M6 0h7M5 1h9M5 2h9M4 3h11M1 4h1M4 4h11M1 5h14M2 6h13M0 7h1M4 7h10M2 8h1M5 8h9M1 9h1M4 9h9M3 10h2M6 10h6M7 11h4M4 12h9M3 13h11M2 14h13M2 15h13" />
      </svg>
    </div>
  ); 
}
