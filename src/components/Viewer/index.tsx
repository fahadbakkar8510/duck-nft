import { useLoader, useThree } from "@react-three/fiber";
import React, { useState, useCallback } from "react";
import { a, useSpring } from '@react-spring/three';
import useMachineStore from "../../store";
import { letters, numbers } from "../../utils/constants";

import './index.css';
import ImageViewer from "react-simple-image-viewer";

import { useEffect } from "react";



export const Viewer = () => {
   //const font = useLoader(FontLoader, './assets/font/Roboto_Regular.json');

    const currentShopping = useMachineStore(state => state.shopping);
    const setCurrentShopping = useMachineStore(state => state.updateShopping);

    const currentCustomDuck = useMachineStore(state => state.currentDuck);
    const setCurrentCustomDuck = useMachineStore(state => state.updateCurrentDuck)

    const currentAdmin = useMachineStore(state => state.admin);
    const setCurrentAdmin = useMachineStore(state => state.updateAdmin);
    
    const [ currentMode, setCurrentMode ] = useState("Shopping");

    const changeMode= (label: string) => {
        console.log('changeMode');
        const currentInfo = { ...currentCustomDuck };

        switch(currentMode) {
            case "Shopping": 
            {
                setCurrentMode("CustomDuck");
                if( letters.indexOf(label) != -1 ) {
                    currentInfo.letter = label;
                 } else if( numbers.indexOf(label) != -1 ) {
                    currentInfo.number = label;
                 }
                setCurrentCustomDuck(currentInfo); 
                break;
            }
            case "CustomDuck": 
            {
                setCurrentMode("Admin"); 
                setCurrentAdmin("");
                break;
            }
            case "Admin": 
            {
                setCurrentMode("Shopping"); 
                setCurrentShopping("");
                break;
            }
            default: break;
        }
        return currentMode;
    }

    const [currentImage, setCurrentImage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const images = [
        "http://placeimg.com/1200/800/nature",
        "http://placeimg.com/800/1200/nature"
    ];

    const openImageViewer = useCallback((index) => {
        setCurrentImage(index);
        setIsViewerOpen(true);
    }, []);

    const closeImageViewer = () => {
        setCurrentImage(0);
        setIsViewerOpen(false);
    };

    const getImageIndex = () => {
        let index = 0;
        switch(currentMode) {
            case "Shopping": index = 0; break;
            case "CustomDuck": index = 1; break;
            case "Admin": index = 2; break;
            default: break;
        }
        return index;
    }

   
    return (
        <div>
            <h1 className = "currentMode">                
                Machine Mode:  {currentMode}                 
            </h1>
            <button className = "changeModeBtn" onClick={() => changeMode("")}>Change Mode</button>
            <div className="view">
                <section style = {{display: "flex"}}>
                    <div>
                        <img
                            src={images[getImageIndex()]}
                            onClick={() => openImageViewer(getImageIndex())}
                            width="300px"
                            height="300px"
                            key={getImageIndex()}
                            style={{ margin: "2px" }}
                            alt=""
                        />
                    </div>
                    <div> 
                        <img
                            src={images[getImageIndex()]}
                            onClick={() => openImageViewer(getImageIndex())}
                            width="400px"
                            height="400px"
                            key={getImageIndex()}
                            style={{ margin: "2px" }}
                            alt=""
                        />
                        
                        {isViewerOpen && (
                            <ImageViewer
                            src={images}
                            currentIndex={currentImage}
                            onClose={closeImageViewer}
                            disableScroll={false}
                            backgroundStyle={{
                                backgroundColor: "rgba(0,0,0,0.9)"
                            }}
                            closeOnClickOutside={true}
                            />
                        )}
                    </div>
                </section>
            </div>
            
        </div>
    )
}

export default Viewer;