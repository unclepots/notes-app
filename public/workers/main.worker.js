
const Notes = {

    

}

self.addEventListener('message', (data) => {
  
  Notes.action[data.action](data.payload);

})