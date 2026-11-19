/* ===== Units from the "Yeni İstanbul A1 tutor" file: ALL its words, sentences and grammar notes (lessons 1-5).
   Loaded after book.js, before extra.js. Sentences (3+ words) also feed the Sentence builder. ===== */
(function(){
const U=(id,icon,title,tip,tAr,pAr,rows)=>({id,icon,title,lvl:"A1",tip,items:rows.map(r=>[r[0],r[1]]),ar:rows.map(r=>r[2]),mt:[tAr,pAr]});
const NEW=[
U("yi-1","🔤","Tutor 1: Alphabet and first words",
 "Spelling is phonetic. Six new letters: ç (çiçek), ğ (dağ, silent: lengthens the vowel before it), ı (kız, dotless i), ö (öğrenci), ş (şehir), ü (üç). There is no 'is': Bu bir kitap = This (is) a book. bir = a/an; ne = what.",
 "الأبجدية والكلمات الأولى",
 "الإملاء صوتي. ستة حروف جديدة: ç ğ ı ö ş ü. حرف ğ صامت ويطيل الحرف المتحرك قبله. لا توجد كلمة «هو/هي»: Bu bir kitap = هذا كتاب. bir = أداة تنكير، ne = ماذا.",[
["arkadaş","friend","صديق"],["bebek","baby","طفل رضيع"],["çiçek","flower","زهرة"],["defter","notebook","دفتر"],["elma","apple","تفاحة"],["masa","table","طاولة"],["okul","school","مدرسة"],["öğrenci","student","طالب"],["kalem","pen","قلم"],["kitap","book","كتاب"],["telefon","phone","هاتف"],["dağ","mountain","جبل"],
["Bu bir kitap.","This is a book.","هذا كتاب."],["Bu bir elma.","This is an apple.","هذه تفاحة."],["Bu ne?","What is this?","ما هذا؟"]]),
U("yi-2","👋","Tutor 2: Greetings and names",
 "Greetings are fixed phrases: learn them whole. Names take a suffix: ad + ım = adım (my name), ad + ın = adın (your name). Hoş geldiniz = gel (come) + di (past) + niz (you, polite). Memnun oldum = pleased (I) became.",
 "التحيات والأسماء",
 "التحيات عبارات ثابتة تُحفظ كاملة. الأسماء تأخذ لاحقة: ad + ım = adım (اسمي)، ad + ın = adın (اسمك).",[
["merhaba","hello","مرحباً"],["günaydın","good morning","صباح الخير"],["iyi akşamlar","good evening","مساء الخير"],["iyi geceler","good night","تصبح على خير"],["hoş geldiniz","welcome","أهلاً بكم"],["hoş bulduk","glad to be here (reply to welcome)","أهلاً بك (رداً على الترحيب)"],["teşekkürler","thanks","شكراً"],["görüşürüz","see you","نراك لاحقاً"],["memnun oldum","nice to meet you","تشرفت بمعرفتك"],["adım","my name","اسمي"],
["Benim adım Emilia.","My name is Emilia.","اسمي إيميليا."],["Adın ne?","What is your name?","ما اسمك؟"],["Memnun oldum.","Nice to meet you.","تشرفت بمعرفتك."],["Hoş geldiniz.","Welcome.","أهلاً بكم."]]),
U("yi-3","🔟","Tutor 3: Numbers 1–10",
 "Learn 1–10 as a chain. After a number the noun stays singular: beş lira, never 'beş liralar'. Kaç = how many / what number: Bu kaç lira? = How much is this?",
 "الأرقام 1–10",
 "تعلّم الأرقام 1–10 كسلسلة. بعد الرقم يبقى الاسم مفرداً: beş lira وليس beş liralar. Kaç = كم.",[
["bir","one","واحد"],["iki","two","اثنان"],["üç","three","ثلاثة"],["dört","four","أربعة"],["beş","five","خمسة"],["altı","six","ستة"],["yedi","seven","سبعة"],["sekiz","eight","ثمانية"],["dokuz","nine","تسعة"],["on","ten","عشرة"],
["Saat kaç?","What time is it?","كم الساعة؟"],["Beş lira.","Five lira.","خمس ليرات."],["Bu kaç lira?","How much is this?","بكم هذا؟"]]),
U("yi-4","🧑‍⚕️","Tutor 4: Vowel harmony, I am / you are",
 "Suffixes copy the LAST vowel of the word. Front vowels (e i ö ü) give e/i/ü forms, back vowels (a ı o u) give a/ı/u forms. I am = -im/-ım/-um/-üm, you are = -sin/-sın/-sun/-sün. After a vowel add y: eczacı + y + ım = eczacıyım.",
 "تناغم الحروف المتحركة: أنا / أنت",
 "اللواحق تنسخ آخر حرف متحرك في الكلمة. أنا = -im/-ım/-um/-üm، أنت = -sin/-sın/-sun/-sün. بعد حرف متحرك نضيف y: eczacıyım.",[
["öğretmen","teacher","معلم"],["doktor","doctor","طبيب"],["avukat","lawyer","محامٍ"],["şoför","driver","سائق"],["garson","waiter","نادل"],["kasiyer","cashier","أمين صندوق"],["kuaför","hairdresser","مصفف شعر"],["eczacı","pharmacist","صيدلي"],
["Ben öğretmenim.","I am a teacher.","أنا معلم."],["Sen öğrencisin.","You are a student.","أنت طالب."],["Ben doktorum.","I am a doctor.","أنا طبيب."],["Ben eczacıyım.","I am a pharmacist.","أنا صيدلي."]]),
U("yi-5","🏠","Tutor 5: Plurals and stacked suffixes",
 "Turkish glues meaning onto the end of a word, one piece at a time: ev (house), ev+ler (houses), ev+ler+im (my houses), ev+ler+im+de (in my houses). Plural is -lar after a back vowel, -ler after a front vowel. -ta/-te = in. var = there is / there are.",
 "الجمع واللواحق المتراكمة",
 "التركية تلصق المعاني في آخر الكلمة قطعة قطعة: ev (بيت)، evler (بيوت)، evlerim (بيوتي)، evlerimde (في بيوتي). الجمع -lar بعد حرف خلفي، و-ler بعد حرف أمامي.",[
["ev","house","بيت"],["oda","room","غرفة"],["sınıf","classroom","صف"],["kapı","door","باب"],["sandalye","chair","كرسي"],["bunlar","these","هذه / هؤلاء"],["var","there is / there are","يوجد"],
["Bunlar kitaplar.","These are books.","هذه كتب."],["Bunlar defterler.","These are notebooks.","هذه دفاتر."],["Sınıfta öğrenciler var.","There are students in the classroom.","يوجد طلاب في الصف."]])
];
const at=UNITS.findIndex(u=>u.id==='bk-polite');
UNITS.splice(at>=0?at:UNITS.length,0,...NEW.map(({ar,mt,...u})=>u));
NEW.forEach(n=>{(TRANS.ar=TRANS.ar||{})[n.id]=n.ar;(META.ar=META.ar||{})[n.id]=n.mt});
})();
