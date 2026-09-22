function(instance, properties, context) {


    
	    document.getElementById(properties.element_id).addEventListener("input", function() {
  this.value = this.value.replace(/[^a-zA-Z]/g, "");
});



}