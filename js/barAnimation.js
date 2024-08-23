var count = 0;

var name_Cell = document.getElementById("Cell_name");
var name_Keys = document.getElementById("Keys_name");

var name_Jewelry = document.getElementById("Jewelry_name");
var name_Medical = document.getElementById("Medical_name");


var width_book = book[0]/320;
var isnum_book = document.getElementById("Book_number");

var width_Carry = Carry[0]/320;
var isnum_Carry = document.getElementById("Carry_number");

var width_Cell = Cell[0]/320;
var isnum_Cell = document.getElementById("Cell_number");

var width_Clothing = Clothing[0]/320;
var isnum_Clothing = document.getElementById("Clothing_number");

var width_Currency = Currency[0]/320;
var isnum_Currency = document.getElementById("Currency_number");

var width_Electronics = Electronics[0]/320;
var isnum_Electronics = document.getElementById("Electronics_number");

var width_Eye = Eye[0]/320;
var isnum_Eye = document.getElementById("Eye_number");

var width_Footwear = Footwear[0]/320;
var isnum_Footwear = document.getElementById("Footwear_number");

var width_Home = Home[0]/320;
var isnum_Home = document.getElementById("Home_number");

var width_Identification = Identification[0]/320;
var isnum_Identification = document.getElementById("Identification_number");

var width_Jewelry = Jewelry[0]/320;
var isnum_Jewelry = document.getElementById("Jewelry_number");

var width_Keys = Keys[0]/320;
var isnum_Keys = document.getElementById("Keys_number");

var width_Medical = Medical[0]/320;
var isnum_Medical = document.getElementById("Medical_number");

var width_Misc = Misc[0]/320;
var isnum_Misc = document.getElementById("Misc_number");

var width_Musical = Musical[0]/320;
var isnum_Musical = document.getElementById("Musical_number");

var width_NYCT = NYCT[0]/320;
var isnum_NYCT = document.getElementById("NYCT_number");

var width_Sports = Sports[0]/320;
var isnum_Sports = document.getElementById("Sports_number");

var width_Tickets = Tickets[0]/320;
var isnum_Tickets = document.getElementById("Tickets_number");

var width_Toys = Toys[0]/320;
var isnum_Toys = document.getElementById("Toys_number");

var width_Wallet = Wallet[0]/320;
var isnum_Wallet = document.getElementById("Wallet_number");

var foo = setInterval(function () {
	if(count == 250) cancelInterval(foo);
	count++;

	width_book = book[count]/320;
	isnum_book.innerHTML = Math.round(width_book * 320);
	document.getElementById('Book_bar').style.width = width_book + 'px';

	width_Carry = Carry[count]/320;
	isnum_Carry.innerHTML = Math.round(width_Carry * 320);
	document.getElementById('Carry_bar').style.width = width_Carry + 'px';

	width_Clothing = Clothing[count]/320;
	isnum_Clothing.innerHTML = Math.round(width_Clothing * 320);
	document.getElementById('Clothing_bar').style.width = width_Clothing + 'px';

	width_Currency = Currency[count]/320;
	isnum_Currency.innerHTML = Math.round(width_Currency * 320);
	document.getElementById('Currency_bar').style.width = width_Currency + 'px';

	width_Electronics = Electronics[count]/320;
	isnum_Electronics.innerHTML = Math.round(width_Electronics * 320);
	document.getElementById('Electronics_bar').style.width = width_Electronics + 'px';

	width_Eye = Eye[count]/320;
	 isnum_Eye.innerHTML = Math.round(width_Eye * 320);
	document.getElementById('Eye_bar').style.width = width_Eye + 'px';

	width_Footwear = Footwear[count]/320;
	 isnum_Footwear.innerHTML = Math.round(width_Footwear * 320);
	document.getElementById('Footwear_bar').style.width = width_Footwear + 'px';

	width_Home = Home[count]/320;
	 isnum_Home.innerHTML = Math.round(width_Home * 320);
	document.getElementById('Home_bar').style.width = width_Home + 'px';

	width_Identification = Identification[count]/320;
	 isnum_Identification.innerHTML = Math.round(width_Identification * 320);
	document.getElementById('Identification_bar').style.width = width_Identification + 'px';

	

	width_Keys = Keys[count]/320;
	width_Cell = Cell[count]/320;

	if (Cell[count] >= Keys[count]) {
		isnum_Keys.innerHTML = Math.round(width_Keys * 320);
		name_Keys.innerHTML = "Keys";
		document.getElementById('Keys_bar').style.width = width_Keys + 'px';
		
		isnum_Cell.innerHTML = Math.round(width_Cell * 320);
		name_Cell.innerHTML = "Accessories";
		document.getElementById('Cell_bar').style.width = width_Cell + 'px';
	}
	else{
		isnum_Keys.innerHTML = Math.round(width_Cell * 320);
		name_Keys.innerHTML = "Accessories ↓";
		document.getElementById('Keys_bar').style.width = width_Cell + 'px';

		isnum_Cell.innerHTML = Math.round(width_Keys * 320);
		name_Cell.innerHTML = "Keys ↑";
		document.getElementById('Cell_bar').style.width = width_Keys + 'px';

	}

	

	width_Medical = Medical[count]/320;
	width_Jewelry = Jewelry[count]/320;

	if (Jewelry[count] >= Medical[count]) {
		name_Medical.innerHTML = "Medical Equipment";
		isnum_Medical.innerHTML = Math.round(width_Medical * 320);
		document.getElementById('Medical_bar').style.width = width_Medical + 'px';
		
		isnum_Jewelry.innerHTML = Math.round(width_Jewelry * 320);
		document.getElementById('Jewelry_bar').style.width = width_Jewelry + 'px';
		name_Jewelry.innerHTML = "Jewelry"
	}
	else{
		name_Medical.innerHTML = Math.round(width_Jewelry * 320);
		name_Medical.innerHTML = "Jewelry ↓";
		document.getElementById('Medical_bar').style.width = width_Jewelry + 'px';

		isnum_Jewelry.innerHTML = Math.round(width_Medical * 320);
		name_Jewelry.innerHTML = "Medical Equipment ↑";
		document.getElementById('Jewelry_bar').style.width = width_Medical + 'px';

	}

	 


	 

	width_Misc = Misc[count]/320;
	 isnum_Misc.innerHTML = Math.round(width_Misc * 320);
	document.getElementById('Misc_bar').style.width = width_Misc + 'px';

	width_Musical = Musical[count]/320;
	 isnum_Musical.innerHTML = Math.round(width_Musical * 320);
	document.getElementById('Musical_bar').style.width = width_Musical + 'px';

	width_NYCT = NYCT[count]/320;
	 isnum_NYCT.innerHTML = Math.round(width_NYCT * 320);
	document.getElementById('NYCT_bar').style.width = width_NYCT + 'px';

	width_Sports = Sports[count]/320;
	 isnum_Sports.innerHTML = Math.round(width_Sports * 320);
	document.getElementById('Sports_bar').style.width = width_Sports + 'px';

	width_Tickets = Tickets[count]/320;
	 isnum_Tickets.innerHTML = Math.round(width_Tickets * 320);
	document.getElementById('Tickets_bar').style.width = width_Tickets + 'px';

	width_Toys = Toys[count]/320;
	 isnum_Toys.innerHTML = Math.round(width_Toys * 320);
	document.getElementById('Toys_bar').style.width = width_Toys + 'px';

	width_Wallet = Wallet[count]/320;
	 isnum_Wallet.innerHTML = Math.round(width_Wallet * 320);
	document.getElementById('Wallet_bar').style.width = width_Wallet + 'px';


}, 1000);