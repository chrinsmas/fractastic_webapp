var quiztitle = "Sierpinski Triangle Quiz";

var quiz = [
      {
          "question" : "Q1: What is a type of fractal that Sierpinski Triangle fractal is known as?",
          "image" : "../img/quiz_img/tree_quiz1.png",
          "choices" : [
                                  "Branching fractal",
                                  "Spiral fractal",
                                  "Quadric fractal",
                                  "Geometric fractal"
                              ],
          "correct" : "Geometric fractal",
          "explanation" : "Correct Answer is Geometric fractal.",
      },
      {
          "question" : "Q2: How is purely geometric fractal created?",
          //"image" : "../img/raccoon_placeholder.jpg",
          "choices" : [
                                  "By applying a simple equation like Z = Z^2 + C repeatedly",
                                  "By connecting random dots",
                                  "By applying thinner branching repeatedly",
                                  "By repeating a simple process"
                              ],
          "correct" : "By repeating a simple process",
          "explanation" : "Correct Answer is By repeating a simple process.",
      },
      {
          "question" : "Q3: What is the second step to draw Sierpinski Triangle?",
          //"image" : "../img/raccoon_placeholder.jpg",
          "choices" : [
                                  "Draw a triangle",
                                  "Draw 3 smaller triangles",
                                  "Connects the centers of each side",
                                  "Draw a circle"
                              ],
          "correct" : "Connects the centers of each side",
          "explanation" : "Correct Answer is Connects the centers of each side.",
      },


    ];

var currentquestion = 0,
   score = 0,
   submt=true,
   picked;

jQuery(document).ready(function($){

   function htmlEncode(value){
     return $(document.createElement('div')).text(value).html();
   }

   function addChoices(choices){
       if(typeof choices !== "undefined" && $.type(choices) == "array"){
           $('#choice-block').empty();
           for(var i=0;i<choices.length; i++){
               $(document.createElement('li')).addClass('choice choice-box').attr('data-index', i).text(choices[i]).appendTo('#choice-block');
           }
       }
   }

   function nextQuestion(){
       submt = true;
       $('#explanation').empty();
       $('#question').text(quiz[currentquestion]['question']);
       $('#pager').text('Question ' + Number(currentquestion + 1) + ' of ' + quiz.length);
       if(quiz[currentquestion].hasOwnProperty('image') && quiz[currentquestion]['image'] != ""){
           if($('#question-image').length == 0){
               $(document.createElement('img')).addClass('question-image').attr('id', 'question-image').attr('src', quiz[currentquestion]['image']).attr('alt', htmlEncode(quiz[currentquestion]['question'])).insertAfter('#question');
           } else {
               $('#question-image').attr('src', quiz[currentquestion]['image']).attr('alt', htmlEncode(quiz[currentquestion]['question']));
           }
       } else {
           $('#question-image').remove();
       }
       addChoices(quiz[currentquestion]['choices']);
       setupButtons();
   }

   //After a selection is submitted, checks if its the right answer
   function processQuestion(choice){
       if(quiz[currentquestion]['choices'][choice] == quiz[currentquestion]['correct']){
           $('.choice').eq(choice).css({'background-color':'#50D943'});
           $('#explanation').html('<strong>Correct!</strong> ' + htmlEncode(quiz[currentquestion]['explanation']));
           score++;
       } else {
           $('.choice').eq(choice).css({'background-color':'#D92623'});
           $('#explanation').html('<strong>Incorrect.</strong> ' + htmlEncode(quiz[currentquestion]['explanation']));
       }
       currentquestion++;
       $('#submitbutton').html('NEXT QUESTION &raquo;').on('click', function(){
           if(currentquestion == quiz.length){
               endQuiz();
           } else {
               $(this).text('Check Answer').css({'color':'#222'}).off('click');
               nextQuestion();
           }
       })
   }

   //Sets up the event listeners for each button.
   function setupButtons(){
       $('.choice').on('mouseover', function(){
           $(this).css({'background-color':'#e1e1e1'});
       });
       $('.choice').on('mouseout', function(){
           $(this).css({'background-color':'#fff'});
       })
       $('.choice').on('click', function(){
           picked = $(this).attr('data-index');
           $('.choice').removeAttr('style').off('mouseout mouseover');
           $(this).css({'border-color':'#222','font-weight':700,'background-color':'#c1c1c1'});
           if(submt){
               submt=false;
               $('#submitbutton').css({'color':'#000'}).on('click', function(){
                   $('.choice').off('click');
                   $(this).off('click');
                   processQuestion(picked);
               });
           }
       })
   }

   //Display score
   function endQuiz(){
       $('#explanation').empty();
       $('#question').empty();
       $('#choice-block').empty();
       $('#submitbutton').remove();
       $('#question').text("You got " + score + " out of " + quiz.length + " correct.");
       $(document.createElement('h2')).css({'text-align':'center', 'font-size':'4em'}).text(Math.round(score/quiz.length * 100) + '%').insertAfter('#question');
   }

   //initialize the quiz
   function init(){
       //add title
       if(typeof quiztitle !== "undefined" && $.type(quiztitle) === "string"){
           $(document.createElement('h1')).text(quiztitle).appendTo('#frame');
       } else {
           $(document.createElement('h1')).text("Quiz").appendTo('#frame');
       }
       //add pager and questions
       if(typeof quiz !== "undefined" && $.type(quiz) === "array"){
           //add pager
           $(document.createElement('p')).addClass('pager').attr('id','pager').text('Question 1 of ' + quiz.length).appendTo('#frame');
           //add first question
           $(document.createElement('h2')).addClass('question').attr('id', 'question').text(quiz[0]['question']).appendTo('#frame');
           //add image if present
           if(quiz[0].hasOwnProperty('image') && quiz[0]['image'] != ""){
               $(document.createElement('img')).addClass('question-image').attr('id', 'question-image').attr('src', quiz[0]['image']).attr('alt', htmlEncode(quiz[0]['question'])).appendTo('#frame');
           }
           $(document.createElement('p')).addClass('explanation').attr('id','explanation').html('&nbsp;').appendTo('#frame');

           //questions holder
           $(document.createElement('ul')).attr('id', 'choice-block').appendTo('#frame');

           //add choices
           addChoices(quiz[0]['choices']);

           //add submit button
           $(document.createElement('div')).addClass('choice-box').attr('id', 'submitbutton').text('Check Answer').css({'font-weight':700,'color':'#222','padding':'30px 0'}).appendTo('#frame');

           setupButtons();
       }
   }

   init();
});