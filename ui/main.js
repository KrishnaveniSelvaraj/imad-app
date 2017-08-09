console.log('Loaded!');
var button =document.getElementById('counter');

button.onclick=function(){
    //create request Object
    var request=new XMLHttpRequest();
    
    //Capture the response and store it in a varaible
    request.onreadystatechange=function(){
        if (request.readyState==XMLHttpRequest.DONE){
            //Take some action
            
            if(request.status===200){
                var counter=request.responseText;
                var span=document.getElementById('count');
                span.innerHTML=counter.toString();
                
            }
        }
        //Not done yet
        
    };
    //Make the request
    request.open('GET','http://krishnaveniselvaraj.imad.hasura-app.io/counter',true);
    request.send(null);
};