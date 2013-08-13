Machine Learning challenge SWOC 2013
====================================
Rise of the Pictionary machines
-------------------------------

wat we hebben:

- grote dataset met drawings (pixelbased)
- windows laptops met 2 a 4 cores
- 4 a 8 gig geheugen per laptop
- 1 avond de tijd

wat we gaan doen:

- met de hand tekenen tijdens de avond
- op basis van de dataset trainen
    - dat betekent dat de dataset en de tekeningen moeten overlappen

wat we willen kunnen:
 
- tablet om op te tekenen, die de tekening naar de server stuurt, hoeft niet fancy.
- groot scherm met overzicht met wat er getekend is, en daarnaast welke team wat geraden heeft 
- clients connecten naar de server om te kunnen meespelen (wel nodig, niet belangrijk dus zo simpel mogelijk)
- de server kiest het woord
- de server houd de tijd en score bij


hoe kunnen we het de client makkelijk maken:

- bestaande lib om tegen de server te praten
- bestaande lib om de dataset uit te lezen

Non functionals
---------------

- optimalisatie naar development tijd!!!

user stories
------------

- de arbiter geeft de tekenaar een woord aan het begin van de ronde
- de arbiter ontvangt een tekening van de tekenaar
- de arbiter geeft plaatjes aan de speler
- de arbiter ontvangt geraden woorden van de speler
- de arbiter onthoudt of de woorden binnen de tijd zijn geraden
- de tekenaar kan aangeven dat hij klaar is met tekenen
- de spelers hebben X tijd nadat de tekenaar klaar is met tekenen
- het scorebord laat de huidige tekening zien
- het scorebord laat een overzicht van woorden die spelers raden zien
- het scorebord laat de naam van elk team zien
- het scorebord laat de actuele stand zien
- de speler meldt zichzelf
- de speler weet welke tekening de definitieve is
- de speler weet wanneer de ronde start en eindigt
- de speler geeft aan bij welke ronde het geraden woord hoort.
- de speler heeft maar een antwoord bij elke ronde

domein model
------------

- speler
- ronde
- woord
- tekeningen

- speler heeft naam en score 
- ronde heeft 1 correct woord
- ronde heeft 1 woord per speler
- ronde heeft 1 tekening
- arbiter bepaalt score 
- tekenaar tekent tekening op basis van woord tijdens ronde
- het spel heeft een * rondes
- het spel heeft 0..1 actuele ronde
- het spel heeft 1 tekenaar

messages
--------

Messages in the system:

    drawing(drawing object)
        - Sent by sketchboard to arbiter to update entire drawing.

    line(line object)
        - Sent by sketchboard for intermediate updates (new lines are drawn).

    finished(drawing object)
        - Sent by sketchboard to arbiter to indicate end of a round.
    
    message NewRound {
        required int round
        required string word
    }
    
    message Drawing {
        required int width
        required int height
        repeated Line lines
    }
    
    package player;
    
    message BeginRound {
        required int round
        required int width;
        required int height;
    }
    
    message EndRound {
        required int round;
        required string word;
    }
    
    message Challenge {
        required int round;
        required Image image;
        required boolean final;
    }
    
    message Guess {
        required string teamName
        required string password;
        required string word
    }
    
    package scoreboard;
    
    message RequestGameState;
    message RequestDrawing;

    message GameState {
        required int round;
        repeated Player players;
    }
    
    message Line {
        required int x1;
        required int y1;
        required int x2;
        required int y2;
    }
    
    message Player {
        required string name;
        required int score;
        required string latestGuess;
    }
    
    message GamestateEvent {
        required string text;
    }
