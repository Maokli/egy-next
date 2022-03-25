// Initialize button with user's preferred color
const enableButton = document.getElementById("enable");
enableButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let url = tab.url;
    const currentEpisode = "ep-" + url[url.indexOf("ep-")+3];
    const nextEpisode = "ep-" + ( parseInt(url[url.indexOf("ep-")+3]) + 1);
    url = url.replace(currentEpisode, nextEpisode);
    chrome.storage.sync.set({url})

    if(!url.includes("egybest"))
        alert("this is not an egybest website")
    else if(!url.includes("episode"))
        alert("this appears to not be a series, make sure you're on an episode page of this series")
    else 
        chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: addNextButton,
        });
  });
  
  // The body of this function will be executed as a content script inside the
  // current page
  function addNextButton() {
    const iframe = document.querySelector("iframe");
    const iframeDocument = iframe.contentWindow.document;
    setInterval(() => {
        let currentTimeFromDom = iframeDocument.querySelector(".vjs-current-time .vjs-current-time-display").innerHTML;
        let currentTime = currentTimeFromDom.split(':');
    
        let durationFromDom = iframeDocument.querySelector(".vjs-duration .vjs-duration-display").innerHTML;
        let duration = durationFromDom.split(':');
        if(currentTime.length == duration.length)
        {
            let valid = true;
            const index = currentTime.length-1;
            if(index <= 0) valid = false;
            for(i=0;i<currentTime.length-2;i++)
                if(currentTime[i] !== duration[i])
                    valid = false;
            
            //calculate last 30 seconds
            const testTime = duration[index] - 30;
            if(testTime < 0){
                testTime = testTime%60;
                duration[index-1] = duration[index-1]-1;
            }
            duration[index] = testTime;
            if(valid)
                if(currentTime[index] >= duration[index])
                {
                    const container = iframeDocument.body.querySelector("div");
                
                    if(!container)
                        alert("something went wrong, cannot find video");
                    else{
                        const nextButton = document.createElement("a");
                
                        //styling the button
                        nextButton.style.padding= ".5rem 3rem";
                        nextButton.style.color= "white";
                        nextButton.style.border= "2px solid white";
                        nextButton.style.backgroundColor= "rgba(0,0,0,0.7)";
                        nextButton.style.textDecoration= "none";
                        nextButton.style.position= "absolute";
                        nextButton.style.bottom= "4rem";
                        nextButton.style.right= "2em";
                
                        chrome.storage.sync.get("url", ({ url }) => {
                            nextButton.addEventListener("click", () => window.location.replace(url))
                        });
                        
                        //adding text
                        const textnode = document.createTextNode('NEXT EPISODE');
                        nextButton.appendChild(textnode);
                
                        //adding the button to the page
                        container.appendChild(nextButton);
                    }
                }
    
        }

    },1000)

  }
