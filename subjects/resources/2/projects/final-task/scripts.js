data = [{
	    "show" : true,
		"pic": "./pictures/SemRush.png",
		"company": "SemRush",
		"company_href": "Ссылка на компанию 1",
		"vacancy": "JS-разработчик",
		"href": "Ссылка на вакансию 1",
		"salary": 50000,
		"lang": "JavaScript",
		"exp": 5,
		"city": "Москва",
		"kw": "java//script//js//джава//скрипт"
	}, {
		"show" : true,
		"pic": "./pictures/Google.png",
		"company": "Google",
		"company_href": "Ссылка на компанию 2",
		"vacancy": "Python-программист",
		"href": "Ссылка на вакансию 2",
		"salary": 150000,
		"lang": "Python",
		"exp": 3,
		"city": "Санкт-Петербург",
		"kw": "python//питон"
	}, {
		"show" : true,
		"pic": "./pictures/Yandex.png",
		"company": "Yandex",
		"company_href": "Ссылка на компанию 3",
		"vacancy": "Скриптер Lua",
		"href": "Ссылка на вакансию 3",
		"salary": 1500000,
		"lang": "Lua",
		"exp": 10,
		"city": "Санкт-Петербург",
		"kw": "lua//луа//скрипт"
	}, {
		"show" : true,
		"pic": "./pictures/FakeCompany.png",
		"company": "FakeCompany",
		"company_href": "Ссылка на компанию 4",
		"vacancy": "Программист на C#",
		"href": "Ссылка на вакансию 4",
		"salary": 60000,
		"lang": "C#",
		"exp": 3,
		"city": "Хельсинки",
		"kw": "c //с //#//шарп//си"
	}, {
		"show" : true,
		"pic": "./pictures/FakeCompany_2.png",
		"company": "FakeCompany 2",
		"company_href": "Ссылка на компанию 5",
		"vacancy": "Разработчик С++",
		"href": "Ссылка на вакансию 5",
		"salary": 25000,
		"lang": "C++",
		"exp": 20,
		"city": "Рим",
		"kw": "c++//с++//++//плюс//си"
	}, {
		"show" : true,
		"pic": "./pictures/C++.png",
		"company": "Рыба-рыба-рыба",
		"company_href": "Ссылка на компанию 5",
		"vacancy": "С++ Программист",
		"href": "Ссылка на вакансию 5",
		"salary": 60000,
		"lang": "C++",
		"exp": 20,
		"city": "Копенгаген",
		"kw": "c++//с++//++//плюс//си"
	}, {
		"show" : true,
		"pic": "./pictures/NodeJS.png",
		"company": "Fishing Inc.",
		"company_href": "Ссылка на компанию 5",
		"vacancy": "Специалист по NodeJS",
		"href": "Ссылка на вакансию 5",
		"salary": 25000,
		"lang": "NodeJS",
		"exp": 20,
		"city": "Стокгольм",
		"kw": "node//js//сервер//server"
	}, {
		"show" : true,
		"pic": "./pictures/Yandex.png",
		"company": "Yanclex Inc.",
		"company_href": "Ссылка на компанию 5",
		"vacancy": "Server-Side программист. PHP",
		"href": "Ссылка на вакансию 5",
		"salary": 15000,
		"lang": "PHP",
		"exp": 20,
		"city": "Стокгольм",
		"kw": "php//server//сервер"
	},
{
	    "show" : true,
		"pic": "./pictures/SemRush.png",
		"company": "SemRush",
		"company_href": "Ссылка на компанию 1",
		"vacancy": "Парень, который ходит по коридорам",
		"href": "Ссылка на вакансию 6",
		"salary": 70000,
		"lang": "JavaScript",
		"exp": 7,
		"city": "Москва",
		"kw": "java//script//js//джава//скрипт"
	}, {
		"show" : true,
		"pic": "./pictures/Google.png",
		"company": "Google",
		"company_href": "Ссылка на компанию 2",
		"vacancy": "Генератор Идей (NodeJS)",
		"href": "Ссылка на вакансию 2",
		"salary": 250000,
		"lang": "NodeJS",
		"exp": 10,
		"city": "Нью-Йорк",
		"kw": "python//питон"
	}, {
		"show" : true,
		"pic": "./pictures/Yandex.png",
		"company": "Yandex",
		"company_href": "Ссылка на компанию 3",
		"vacancy": "Бухгалтер (1C)",
		"href": "Ссылка на вакансию 3",
		"salary": 1500000,
		"lang": "1C",
		"exp": 10,
		"city": "Санкт-Петербург",
		"kw": "1с//1c//учет"
	}, {
		"show" : true,
		"pic": "./pictures/FakeCompany.png",
		"company": "FakeCompany",
		"company_href": "Ссылка на компанию 4",
		"vacancy": "Программист C#",
		"href": "Ссылка на вакансию 4",
		"salary": 80000,
		"lang": "C#",
		"exp": 5,
		"city": "Мадрид",
		"kw": "c //с //#//шарп//си"
	}, {
		"show" : true,
		"pic": "./pictures/FakeCompany_2.png",
		"company": "FakeCompany 2",
		"company_href": "Ссылка на компанию 5",
		"vacancy": "Разработчик Ruby",
		"href": "Ссылка на вакансию 5",
		"salary": 25000,
		"lang": "Ruby",
		"exp": 20,
		"city": "Рим",
		"kw": "ruby//руби"
	}
]

let check_array_comp = [],
	check_array_lang = [],
	check_array_exp = [],
	check_array_city = [];

window.addEventListener("load", start);

function start() {
	let con = document.getElementById('main_content'),
        wrap = document.createElement("div");

	wrap.classList.add("panel");
	wrap.classList.add("panel-default");

	con.innerHTML = '';
	
	for (i = 0; i < data.length; i++) {
		let div = document.createElement("div"),
            opt_company = document.createElement("option"),
            opt_lang = document.createElement("option"),
            opt_exp = document.createElement("option"),
            opt_city = document.createElement("option"),
			company_b = false,
			lang_b = false,
			exp_b = false,
			city_b = false;	

        data[i].show = true;			
				
		div.classList.add("panel-heading");
		div.classList.add("main_content_class");
		div.classList.add("col-md-12");
		div.innerHTML = form_result(data[i]);

		div.addEventListener("click",transfer_to.bind(null,data[i].href));
		con.appendChild(div);
		
		//Проверка input-list на наличие варианта

		 for (let j=0;j<check_array_comp.length;j++){
		  if (data[i].company == check_array_comp[j]){
			company_b = true; 
		 }}
		 
		 for (let j=0;j<check_array_lang.length;j++){  
		  if (data[i].lang == check_array_lang[j]){
			lang_b = true; 
		 }}

		 for (let j=0;j<check_array_exp.length;j++){  		 
		  if (data[i].exp == check_array_exp[j]){
			exp_b = true; 
		 }}

		 for (let j=0;j<check_array_city.length;j++){  		 
		  if (data[i].city == check_array_city[j]){
			city_b = true; 
		 }}
		
		 
		//Заполнение input-list вариантами		 
		if (company_b == false){
		opt_company.value = data[i].company;
		check_array_comp.push(data[i].company);
		}
		if (lang_b == false){
		opt_lang.value = data[i].lang;
		check_array_lang.push(data[i].lang);
		}
		if (exp_b == false){
		opt_exp.value = data[i].exp;
		check_array_exp.push(data[i].exp);
		}		
		if (city_b == false){
		opt_city.value = data[i].city;
		check_array_city.push(data[i].city);
		}	

		document.getElementById("company_list").appendChild(opt_company);
		document.getElementById("lang_list").appendChild(opt_lang);
		document.getElementById("exp_list").appendChild(opt_exp);
		document.getElementById("city_list").appendChild(opt_city);
	}
	
// Обработка нажатий на кнопки	
	document.getElementById("search_button").addEventListener("click",search_start);
	document.getElementById("filtres_apply_button").addEventListener("click",apply_filters);
	document.getElementById("mobile_filtres_apply_button").addEventListener("click",apply_filters);
}

function search_start() {
 let req = document.getElementById("search_input").value,
     arr = [],
	 res = [],
	 field = document.getElementById("main_content"),
	 button = document.createElement("button");
	 
 arr = (req.toLowerCase()).split(" ");
 
 //Ищем вхождение ключевых слов в запрос
 for(let i=0;i<data.length;i++){
	let kw = [],
	check = false;
	
	data[i].show = false;
	
    kw = (data[i].kw).split("//");	

	for(let r=0;r<arr.length;r++){
	   for(let d=0;d<kw.length;d++){
		 if (arr[r].indexOf(kw[d]) != -1){
		  for(c=0;c<res.length;c++){ 
		   if (i == res[c]) {check = true;}
		  }
		  if (check == false){ 
		    res.push(i);
		    data[i].show = true;
			                 }			
		 }	
	   }		
	}
 }

// Формируем новый список вакансий - уже по результатам поиска 
 field.innerHTML = '';
 if (res.length != 0){
	 for(let i=0;i<res.length;i++){
		for(let j=0;j<data.length;j++){
		  if (res[i] == j){
		   let div = document.createElement("div");
		   div.classList.add("panel-heading");
		   div.classList.add("main_content_class");
		   div.classList.add("col-md-12");
		   div.innerHTML = form_result(data[j]);

		   div.addEventListener("click",transfer_to.bind(null,data[j].href));
		   field.appendChild(div);
		  } 
		}
	 }
 } else {
	field.innerHTML = '<h2 class="text-danger">По вашему запросу ничего не найдено. Пожалуйста, составьте запрос иначе.</h2>'; 
 }
  button.innerHTML = 'Показать весь список вакансий';
  button.classList.add('btn');
  button.classList.add('btn-primary');
  button.classList.add('form-control'); 
  button.id = 'to_start_button';  
  field.appendChild(button);
  
  document.getElementById("to_start_button").addEventListener("click",start);  
}

function apply_filters() {
  let f_comp = document.getElementById("f_comp").value || document.getElementById("mobile_f_comp").value,
      f_lang = document.getElementById("f_lang").value || document.getElementById("mobile_f_lang").value,
      f_exp = document.getElementById("f_exp").value || document.getElementById("mobile_f_exp").value,
      f_city = document.getElementById("f_city").value || document.getElementById("mobile_f_city").value,
      f_salary_min = document.getElementById("f_salary_min").value || document.getElementById("mobile_f_salary_min").value,
      f_salary_max = document.getElementById("f_salary_max").value || document.getElementById("mobile_f_salary_max").value,
      field = document.getElementById("main_content"),
      comp = true,
      lang = true,
      exp = true,
      city = true,
      salary_min = true,
      salary_max = true;
	console.log(f_comp,f_lang,f_exp,f_city,f_salary_min,f_salary_max)
  field.innerHTML = '';
	
  // Применять ли фильтр Компании?
  if (f_comp.replace(" ","") != '') {
	    comp = true; 
	 } else {
		comp = false;  
	 }
  
  // Применять ли фильтр Язык?
  if (f_lang.replace(" ","") != '') {
	    lang = true; 
	 } else {
		lang = false;  
	 }
  
  // Применять ли фильтр Опыт?
  if (f_exp.replace(" ","") != '') {
	    exp = true;
        f_exp = +f_exp;		
	 } else {
		exp = false;  
	 }
    
  // Применять ли фильтр Город?
  if (f_city.replace(" ","") != '') {	 
		city = true; 
	 } else {
		city = false;  
	 }
	 
  // Применять ли фильтр Зарплата от минимума?
  if (f_salary_min.replace(" ","") != '') {	 
		salary_min = true; 
		f_salary_min = +f_salary_min;
	 } else {
		salary_min = false;  
	 }

  // Применять ли фильтр Зарплата от максимума?
  if (f_salary_max.replace(" ","") != '') {	 
		salary_max = true; 
		salary_max = +salary_max;
  } else {
		salary_max = false;  
	}	 
	
for(let i=0; i<data.length;i++){ 
 let div = document.createElement("div"),
    comp_ok = true,
    lang_ok = true,
    exp_ok = true,
    city_ok = true,
    salary_ok = true;
	 	 
 if (data[i].show == true){
 // Проверяем, подходит ли предложение по компании
   if (comp == true) {
	  if (f_comp.toLowerCase() == data[i].company.toLowerCase()){
		comp_ok = true;  
	  } else {
		comp_ok = false;  
	  }
   }
 // Проверяем, подходит ли предложение по языку
   if (lang == true) {
	  if (f_lang.toLowerCase() == data[i].lang.toLowerCase()){
		lang_ok = true;  
	  } else {
		lang_ok = false;  
	  }
   }
 // Проверяем, подходит ли предложение по опыту
   if (exp == true) {
	  if (f_exp >= data[i].exp){
		exp_ok = true;  
	  } else {
		exp_ok = false;  
	  }
   }
 // Проверяем, подходит ли предложение по городу
   if (city == true) {
	  if (f_city.toLowerCase() == data[i].city.toLowerCase()){
		city_ok = true;  
	  } else {
		city_ok = false;  
	  }
   }
 // Проверяем, подходит ли предложение по зарплате
   if ((salary_min == true) || (salary_max == true)) {
	   
	   // Когда заданы и максимум и минимум
     if ((salary_min == true) && (salary_max == true)){
	   if ((data[i].salary >= f_salary_min) && (data[i].salary <= f_salary_max)){
		  salary_ok = true;  
	   } else {
		  salary_ok = false;
	   }		   
	 }
 	   // Когда задан только минимум
     if ((salary_min == true) && (salary_max == false)){
	   if (data[i].salary >= f_salary_min){
		  salary_ok = true;  
	   } else {
		  salary_ok = false;
	   }		   
	 }
 	   // Когда задан только максимум
     if ((salary_min == false) && (salary_max == true)){
	   if (data[i].salary <= f_salary_max){
		  salary_ok = true;  
	   } else {
		  salary_ok = false;
	   }		   
	 }	 
   }
   
if ((comp_ok == true) && (lang_ok == true) && (exp_ok == true) && (city_ok == true) && (salary_ok == true)) {	  
		   div.classList.add("panel-heading");
		   div.classList.add("main_content_class");
		   div.classList.add("col-md-12");
		   div.innerHTML = form_result(data[i]);

		   div.addEventListener("click",transfer_to.bind(null,data[i].href));
		   field.appendChild(div);

 }	
	
}
}
}

function transfer_to(link) {
 window.location = link;
}

function form_result(data) {
	return "<div class=\"test col-md-8\"><div class=\"hidden-xs col-xs-1 col-md-3\"><img src=\"" + data.pic + "\"></div><dl>  <dt>    " + data.vacancy + "</a>  </dt>  <dd>    \u041A\u043E\u043C\u043F\u0430\u043D\u0438\u044F:       <span class=\"company_span\">        " + data.company + "</span>\n\t\t\t\t<p> - " + data.city + " - " + data.exp + " -</p></dd></dl></div><div class=\"col-md-4\"><h3 class=\"text-success\">   " + data.salary + " \u20BD</h3></div>";
}


