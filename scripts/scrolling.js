window.onscroll = async function(e){
	var origin = window.location.origin;
	var current = window.location.pathname;
	if(window.scrollY == 0){
		console.log("at top");
		if(current == "/pages/policies.html"){
			window.location.replace(origin+"/index.html");
		}else if(current == "/pages/compare.html"){
			window.location.replace(origin+"/pages/policies.html");
		}else if(current == "pages/conclusion.html"){
			window.location.replace(origin+"/pages/compare.html");
		}
		await new Promise(r => setTimeout(r,2));
	}if((window.innerHeight + window.scrollY) >= (document.body.offsetHeight + 50)){ // at bottom
		console.log(window.location);
		if(current == "/index.html"){
			window.location.replace(origin + "/pages/policies.html");
		}else if(current == "/pages/policies.html"){
			window.location.replace(origin + "/pages/compare.html");
		}else if(current == "/pages/compare.html"){
			window.location.replace(origin + "/pages/conclusion.html");
		}
		await new Promise(r=> setTimeout(r,20)); 
	}else{
		document.body.classList.add('framed');
	}
}
