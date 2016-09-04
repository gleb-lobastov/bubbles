/* 
 * Bubbles - наглядно представляет алгоритм сортировки методом пузырьков.
 * 
 * Основные функции инкапсулированы в модуле useBubbles, он предоставляет методы
 *    setup для задания значений элементов массива и 
 *    sort для выполнения пошаговой сортировки, во время которой пользователь
 * видит подсказки о том, как работает алгоритм.
 *
 * 
 * 2014, Лобастов Глеб
 *
 * Нет ограничений на изменение и использование кода
 */


var BUBBLES_COUNT = 7,
    EFFECTS_DURATION = 800;
      
      
$( document ).ready(function() {
   // Textarea может хранить содержимое с прошлой сессии. 
   tools.validateUserInput();
});


//namespace для вспомогательных функций
var
   tools = {

   /*Проверка, не ошибся ли пользователь. 
    *Если да - то заблокируем submit и сделаем красную рамку на поле ввода */
   'validateUserInput': function () {
      var 
         $input  = $('#userInput'), //id Textarea
         $okBtn  = $('#ok'),        //id кнопки ok     
         isWrong = !$input.val().match(/^((\-?[0-9]){1,3}([\ \r\n]+|$)){0,7}$/);
   
      $input.toggleClass('wrong',isWrong);
      $okBtn.prop('disabled',isWrong);
   },
   
   /* заданы a и b => целое от a до b, 
      только a => целое от 0 до a, 
      ничего => 0 или 1 */
   'random': function ( a, b ) {
      var _a = a;
      a = !!b && a || 0;
      b = b || _a || 1;
      
      return Math.round(( Math.random() * (b - a)) + a)
   }
}


var useBubbles = (function () {

   //Конструктор для создания пузырька в DOM
   // value - числовое значение 
   function Bubble ( value, index ) {
      if (index == null) { 
         index = tools.random(1, 4)
      };
      
      this.value = value;
      this.$ = $( '<li>' ).
                  addClass( 'bubble' ).
                  addClass( 'morph' + ( index % 4 + 1 )).
                  //data( 'index', index ).
                  text( value ).
                  appendTo( '#bubbles' );
   }

   //Переопределение методов преобразования в примитив  
   //Очень просто получить число пузырька в массиве: container[n]
   Bubble.prototype.valueOf = function () {
      return parseInt( this.$.text(), 10 )
   }
   
   Bubble.prototype.toString = function () {
      return this.$.text()
   }
   
   function Hint(text) {
      this.text = text;
      this.pos = 0;
      this.released = false;
   }
   
   Hint.prototype.tryRelease = function ( index ) {
      if ( !this.released && (!!index && index > 0 || index === 0)) {
          
         inform( index, this.text )        ;
         this.released = true;   
         return this.text;
         
      } else {
         return false
      }
   }
   
   var 
      container = [], //Контейнер ссылок на объекты Bubble
      actual    = -1, //Индекс в container, на котором находится алгоритм сортировки
      above     = -1, //Индекс соседа слева (сверху на визуализации)
      sortedTop = -1, //Количество отсортированных элементов к началу итерации
      blink     = true, //
      lock      = {   
         sort   : false,  //Блокировка от повторного вызова функции sort
         confirm: true    //Блокировка от повторного возврата, при прерывании на показ подсказки
      },
      hints      = {
         beforeSort: new Hint("Начинаем проверку с глубины — сравним два нижних пузырька"),
         afterSort : new Hint("Ну вот и все, теперь вы знаете, что кроме огня и воды, бесконечно можно смотреть еще и на сортировку пузырьков"),
         skip      : new Hint("Этот пузырек тяжелее, чем тот, что над ним. Потому он останется на месте, а мы проверим соседа сверху"),
         exchange  : new Hint("Ага, этот пузырек легче соседа сверху, сейчас он всплывет"),
         reachTop  : new Hint("Самый легкий пузырек оказался наверху. Отлично, отметим его фиолетовым. Больше его двигать не будем"),
         second    : new Hint("Мы прошлись один раз снизу доверху. Идем на второй заход, но теперь без сравнения с верхним пузырьком"),
         secondTop : new Hint("Второй из самых легких — оказался на втором месте. Тоже покрасим в фиолетовый. Осталось не так уж много.")
         };
         
   var step = function () {
      if (!!hints['beforeSort'].tryRelease(container.length - 1)) {return false};
      
      if (actual <= sortedTop) {
         
         if (sortedTop >= container.length - 2) { //сортировка завершена
              
            //Игнорируем этот кусок кода на второй проход  
            if (!hints['afterSort'].released) {
               /* Отмечаем сортированные пузырьки цветом.
                * на самом деле - здесь только последние два, они остаются бесцветными,
                * т.к. по алгоритму нет нужды их проверять. Здесь точка выхода             
                * все остальные отмечаются несколькими строками ниже */  
               for (var i = 1; i <= Math.min(container.length,2); i++ ) {
                  container[container.length - i].$.addClass('sorted');
               }
            }
                     
            if (!!hints['afterSort'].tryRelease(0)) { return false };
            
            //Очистка стилей через небольшое время после окончания сортировки
            setTimeout(function () {
               if (!lock.sort) { //Проверка, если уже началась новая сортировка то отбой
                  $('.bubble').removeClass('sorted');
               }
            }, 2500);
            
            //Реинициализация переменных
            actual = above = sortedTop = -1;
            
            //Теперь можно запускать новую сортировку
            lock.sort = false;
            
            //Нормальная точка выхода, если общий return false - возможно, что-то пошло не так
            console.log('done');
            $('#ok').val('Еще раз');
            return true; 
         
         }
         
         //После каждой проходки отмечаем последний пузырек как отсортированный      
         if (sortedTop >= 0) {
            container[sortedTop].$.addClass('sorted');
            if (!!hints['reachTop'].tryRelease(sortedTop)) { return false }
            if (sortedTop == 1 && !!hints['secondTop'].tryRelease(sortedTop)) { return false };
            }
         
         //Ставим указатель в конец массива (сортируем с конца, а выглядит это как всплытие)
         actual = container.length - 1;
         sortedTop++;
         
         //Следующий шаг, после небольшой задержки на анимацию
         setTimeout( function () {
            if (sortedTop == 1 && !!hints['second'].tryRelease(container.length - 1)) {return false};
            step();
         }, EFFECTS_DURATION );
         return false;
         }
            
      above = actual - 1;
      
      if (
         actual > 0
         && 
         container[actual] < container[above]
      ) {
        
         
         var $actual = container[actual].$;
         var $above  = container[above ].$;
         
         $actual.addClass('animated');
         $above .addClass('animated');
         
         if (!!hints['exchange'].tryRelease(actual)) { return false };

         // Расстояние между элементами в px
         var distance = 
            ($actual.offset().top + $actual.outerHeight()) 
             - 
            ($above.offset().top + $above.outerHeight());              
         
        //Добавим немного случайности
         var sign = tools.random()*2 - 1;
         //console.log('go anmate: actual was '+actual+'/'+container[actual].element.text()+' and above was '+above+'/'+container[above].element.text()+' depthOfStep = '+xdepth+' count = '+xcount);
         $actual.animate({
            'top'  : -distance,
            'width': 20,
            'left' : sign*10
            }, {
            duration: EFFECTS_DURATION,
            easing  : 'recurrentSinus', 
            specialEasing: {
               top: 'easeInOutQuart'
            }});
   
         $above.animate ({
            'top'  : distance,
            'width': 20,
            'left' :-sign*10
            }, {
            duration: EFFECTS_DURATION,
            easing  :'recurrentSinus',
            specialEasing: {
               top: 'easeInOutQuart'
            },
            complete: function() {
               // Закреление в DOM нового положения элементов
               $actual.insertBefore($above);
               
               $actual.removeClass('animated').css('top', 0);
               $above .removeClass('animated').css('top', 0); 
                     
               swap(); //Замена элементов во внутреннем массиве   
               
               step(); //Теперь можно на следующий шаг    
            }
         });
         
         return false;
      } else {
                 
         if (actual > 1) {
            var $actual = container[actual].$;
            var $above  = container[above ].$;
            $actual.addClass('stay');
            if (!!hints['skip'].tryRelease(actual)) { return false };
         } else {
            actual--;   
            step();
            return false;
         }
        
        setTimeout(function () {
        
            //if (!!$actual) { 
               $actual.removeClass('stay');
               //if (actual > 2 || container[actual-1] < container[actual-2]) {
               //   $above.addClass('animated');
               //}// else {
                  $above.addClass('stay');
               //}
               
               setTimeout(function () {
               
                  $above.removeClass('stay');
                  actual--;   
                  step(); 
            
               }, EFFECTS_DURATION/2);
            //}
            
         }, EFFECTS_DURATION/2);
         
         return false;
      } 
         
   return false;
   }
      
   var swap = function() {
      var tmp = container[actual];
      container[actual] = container[above]
      container[above] = tmp;
      actual = above;
   }
         
/* Отображение хинта для пользователя, объясняющий процесс сортировки,
 * на чем процесс прерывается, до тех пор, пока пользователь не нажмет "продолжить" */
   var inform = function ( index, message ) {
      if (message === false) {
         return step();
      }
      container[index].$.
         addClass( 'show-tip' ).
         attr( 'data-tip', message ).
         click( onConfirm );  
        
      
      if (blink) {
         $( '.content-box' ).addClass( 'show-tip' );
         var counter = 4;
         var interval = setInterval(function () {
            container[index].$.toggleClass('blink');
            if (counter-- < 0) {
               clearInterval(interval)
            };
         } ,200);
        
         blink = false;
      }
      lock.confirm = false;
      };
   
   var onConfirm = function () {
      if (lock.confirm) {
         return
      }
      lock.confirm = true;
      $('.show-tip').removeClass('show-tip');
      step();
   }
         
   return {
      sort: function () {
         if (lock.sort) {
               return false
            }
            
         lock.sort = true;
         
         step();
      },
      
      //Вообще это одна функция с sort, но так уж осталось, да и проект учебный
      setup: function (values) {
         if (!lock.sort) {
         
            $('#bubbles').empty();
            container = [];
   
            for (var i = 0; i < values.length; i++) { 
               container.push(new Bubble( values[i], i ) );
            }
         }
         
         return useBubbles;
      }
   }
}) ();

function letsGo ( option ) {

   var $input = $( '#userInput' );
   var  input = $input.val().replace( /[\r\n]/g, ' ' ).replace( / +(?= )/g, '' );

   var values = [];
   
   var random = (option === 'random');
   
   if ( !input || random ) {
      for (var i = 0; i < BUBBLES_COUNT; i++) {
         values.push( Math.floor(( Math.random() * 100 ) + 1 ));
      }
   $input.val( values.join(' ') );
   } 
   else {
      values = input.
         split(' ').
         slice(0,BUBBLES_COUNT).
         map(function(item) {
            return parseInt(item, 10);
         });
   }

   useBubbles.setup(values).sort();
}