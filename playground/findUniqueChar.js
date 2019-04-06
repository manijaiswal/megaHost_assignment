function findUniqueChar(array_str){
	var arr = array_str.split('');
	
	var  isUnique = false;
	for(var i=0;i<arr.length;i++){
		for(var j=i+1;j<arr.length;j++){
	if(arr[i]==arr[j]){
  	isUnique = false;
	return isUnique
}
}
	
}

isUnique = true;
return isUnique
}

var x= findUniqueChar("manishklskl");
console.log(x);
