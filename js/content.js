/* ===== extra learning content (English + Arabic): stories, dialogues, grammar cards, culture notes. Original text. ===== */
(function(){
const g=(tr,en,ar)=>({tr,en,ar});
const STORIES=[
{id:'s1',icon:'🥨',title:['A morning in Istanbul','صباح في إسطنبول'],
 tok:[g('Ali','Ali (a name)','علي (اسم)'),g('sabah','in the morning','في الصباح'),g('erken','early','باكراً'),g('kalkar.','gets up.','يستيقظ.'),g('Simit','a simit','سميت'),g('alır','buys','يشتري'),g('ve','and','و'),g('çay','tea','شاي'),g('içer.','drinks.','يشرب.'),g('Sonra','Then','ثم'),g('vapura','onto the ferry','على الباخرة'),g('biner.','boards.','يركب.')],
 q:['What does Ali drink?','ماذا يشرب علي؟'],o:[['Tea','الشاي'],['Coffee','القهوة'],['Water','الماء']],a:0},
{id:'s2',icon:'💍',title:['A weekend at the bazaar','عطلة نهاية الأسبوع في السوق'],
 tok:[g('Ayşe','Ayşe (a name)','عائشة (اسم)'),g('Kadıköy\'de','in Kadıköy','في قاضي كوي'),g('yaşıyor.','lives.','تعيش.'),g('Hafta sonu','At the weekend','في عطلة الأسبوع'),g('arkadaşlarıyla','with her friends','مع صديقاتها'),g('Kapalıçarşı\'ya','to the Grand Bazaar','إلى الكابالي تشارشي'),g('gidiyor.','goes.','تذهب.'),g('Orada','There','هناك'),g('güzel','beautiful','جميلة'),g('bir','a / one','واحدة / أداة تنكير'),g('halı','carpet','سجادة'),g('görüyor','sees','ترى'),g('ama','but','لكن'),g('çok','very','جداً'),g('pahalı.','expensive.','غالية.')],
 q:['How is the carpet?','كيف هي السجادة؟'],o:[['Beautiful but very expensive','جميلة لكنها غالية جداً'],['Cheap and small','رخيصة وصغيرة'],['Old and dirty','قديمة ومتسخة']],a:0},
{id:'s3',icon:'💊',title:['At the pharmacy','في الصيدلية'],
 tok:[g('Mehmet\'in','Mehmet\'s','محمد'),g('başı','head (his)','رأسه'),g('ağrıyor.','aches.','يؤلمه.'),g('Eczaneye','To the pharmacy','إلى الصيدلية'),g('gidiyor','he goes','يذهب'),g('ve','and','و'),g('ağrı kesici','painkiller','مسكّن للألم'),g('istiyor.','wants.','يريد.'),g('Eczacı','The pharmacist','الصيدلاني'),g('“Günde','“Per day','«في اليوم'),g('iki','two','اثنان'),g('kere”','times”','مرات»'),g('diyor.','says.','يقول.')],
 q:['How often should he take it?','كم مرة يجب أن يتناوله؟'],o:[['Twice a day','مرتان في اليوم'],['Once a day','مرة واحدة في اليوم'],['Never','أبداً']],a:0}];

/* dialogue: each step = what the other person says + replies [tr, en, ar, isCorrect] */
const r=(tr,en,ar,ok)=>({tr,en,ar,ok:!!ok});
const DIALOGS=[
{id:'d1',icon:'🥨',title:['At the simit stand','عند بائع السميت'],steps:[
 {who:g('Buyurun, ne istersiniz?','What would you like?','تفضّل، ماذا تريد؟'),opts:[r('Bir simit, lütfen.','One simit, please.','سميت واحد من فضلك.',1),r('Hoşça kal.','Goodbye.','مع السلامة.'),r('Ben öğrenciyim.','I am a student.','أنا طالب.')]},
 {who:g('Yanında çay ister misiniz?','Would you like tea with it?','هل تريد شاياً معه؟'),opts:[r('Evet, bir çay da alayım.','Yes, I will have a tea too.','نعم، سآخذ شاياً أيضاً.',1),r('Kitap okuyorum.','I am reading a book.','أنا أقرأ كتاباً.'),r('Dün sinemaya gittim.','Yesterday I went to the cinema.','ذهبت أمس إلى السينما.')]},
 {who:g('Toplam on beş lira.','The total is fifteen liras.','المجموع خمس عشرة ليرة.'),opts:[r('Buyurun, teşekkür ederim.','Here you are, thank you.','تفضّل، شكراً لك.',1),r('Metro nerede?','Where is the metro?','أين المترو؟'),r('Günaydın!','Good morning!','صباح الخير!')]}]},
{id:'d2',icon:'💍',title:['In the Grand Bazaar','في الكابالي تشارشي'],steps:[
 {who:g('Hoş geldiniz! Bakabilirsiniz.','Welcome! Feel free to look.','أهلاً بك! تفضّل بالنظر.'),opts:[r('Teşekkürler, sadece bakıyorum.','Thanks, I am just looking.','شكراً، أنا فقط أتفرّج.',1),r('Hesap, lütfen.','The bill, please.','الحساب من فضلك.'),r('Ben hastayım.','I am ill.','أنا مريض.')]},
 {who:g('Bu çanta yüz elli lira.','This bag is 150 liras.','هذه الحقيبة بمئة وخمسين ليرة.'),opts:[r('Çok pahalı, indirim yapar mısınız?','Too expensive, can you give a discount?','غالٍ جداً، هل يمكنك تخفيض السعر؟',1),r('Günaydın.','Good morning.','صباح الخير.'),r('Su ister misiniz?','Would you like water?','هل تريد ماءً؟')]},
 {who:g('Size son fiyat yüz yirmi lira.','The final price for you is 120 liras.','آخر سعر لك مئة وعشرون ليرة.'),opts:[r('Tamam, alıyorum.','Okay, I will take it.','حسناً، سآخذه.',1),r('Nerelisiniz?','Where are you from?','من أين أنت؟'),r('Ben öğrenciyim.','I am a student.','أنا طالب.')]}]},
{id:'d3',icon:'💊',title:['At the pharmacy','في الصيدلية'],steps:[
 {who:g('Buyurun, nasıl yardımcı olabilirim?','Please, how can I help?','تفضّل، كيف يمكنني مساعدتك؟'),opts:[r('Başım ağrıyor, ağrı kesici var mı?','I have a headache, do you have painkillers?','عندي صداع، هل يوجد مسكّن؟',1),r('Bir simit, lütfen.','One simit, please.','سميت واحد من فضلك.'),r('Yarın okula gidiyorum.','Tomorrow I am going to school.','غداً سأذهب إلى المدرسة.')]},
 {who:g('Reçeteniz var mı?','Do you have a prescription?','هل معك وصفة طبية؟'),opts:[r('Hayır, reçetem yok.','No, I do not have a prescription.','لا، ليس معي وصفة.',1),r('Evet, ben öğrenciyim.','Yes, I am a student.','نعم، أنا طالب.'),r('Bu ne kadar?','How much is this?','بكم هذا؟')]},
 {who:g('Günde iki kez, yemekten sonra için.','Twice a day, take it after meals.','مرتين في اليوم، تناوله بعد الأكل.'),opts:[r('Anladım, teşekkür ederim.','I understand, thank you.','فهمت، شكراً لك.',1),r('Metro nerede?','Where is the metro?','أين المترو؟'),r('Çok güzel bir halı!','What a beautiful carpet!','يا لها من سجادة جميلة!')]}]}];

/* grammar cards: t = title, b = text, ex = examples */
const GRAM=[
{t:['Vowel harmony: e / a','انسجام الحروف المتحركة: e / a'],b:['Many suffixes have two forms. After the vowels e, i, ö, ü use the “e” form; after a, ı, o, u use the “a” form.','كثير من اللواحق لها شكلان. بعد الحروف e و i و ö و ü نستخدم صيغة «e»، وبعد a و ı و o و u نستخدم صيغة «a».'],ex:['ev → evler','okul → okullar','göz → gözler','kitap → kitaplar']},
{t:['Vowel harmony: i / ı / u / ü','انسجام الحروف المتحركة: i / ı / u / ü'],b:['Other suffixes have four forms that copy the last vowel: e, i → i · a, ı → ı · o, u → u · ö, ü → ü.','لواحق أخرى لها أربعة أشكال تتبع آخر حرف علة: e و i ← i · a و ı ← ı · o و u ← u · ö و ü ← ü.'],ex:['ev → evim (my house)','kız → kızım','okul → okulum','göz → gözüm']},
{t:['Plural: -ler / -lar','الجمع: -ler / -lar'],b:['Add -ler after front vowels and -lar after back vowels. After a number the noun stays singular.','نضيف -ler بعد الحروف المتحركة الأمامية و -lar بعد الخلفية. وبعد الرقم يبقى الاسم مفرداً.'],ex:['ev → evler','kedi → kediler','kitap → kitaplar','iki kitap (two books)']},
{t:['In / at: -de / -da','في: -de / -da'],b:['Add -de or -da by vowel harmony. After the hard consonants ç f h k p s ş t it becomes -te / -ta.','نضيف -de أو -da حسب انسجام الحروف المتحركة. وبعد الحروف الصلبة ç f h k p s ş t تصبح -te / -ta.'],ex:['ev → evde','okul → okulda','kitap → kitapta','İstanbul’da']},
{t:['From: -den / -dan','من: -den / -dan'],b:['Same pattern as -de / -da with an n at the end: -den, -dan, -ten, -tan.','نفس نمط -de / -da مع إضافة n في النهاية: -den و -dan و -ten و -tan.'],ex:['ev → evden','okul → okuldan','kitap → kitaptan','İstanbul’dan']},
{t:['To: -e / -a','إلى: -e / -a'],b:['Add -e or -a. After a vowel add the buffer letter y: araba → arabaya.','نضيف -e أو -a. وبعد حرف علة نضيف حرف الوصل y: araba ← arabaya.'],ex:['ev → eve','okul → okula','araba → arabaya','Taksim’e']},
{t:['The object: -i / -ı / -u / -ü','المفعول به المعرّف: -i / -ı / -u / -ü'],b:['A definite object takes a four-way suffix (buffer y after a vowel). Final p, ç, t, k often soften before a vowel: kitap → kitabı.','المفعول به المعرّف يأخذ لاحقة رباعية (وحرف الوصل y بعد حرف العلة). والحروف الأخيرة p و ç و t و k تلين غالباً قبل حرف العلة: kitap ← kitabı.'],ex:['Kitabı okuyorum.','Çayı içiyorum.','Kediyi görüyorum.']},
{t:['Of: the owner and the owned','الإضافة: المالك والمملوك'],b:['The owner takes -in/-ın/-un/-ün (buffer n after a vowel) and the owned thing takes -i/-ı/-u/-ü.','المالك يأخذ -in/-ın/-un/-ün (وحرف الوصل n بعد حرف العلة) والشيء المملوك يأخذ -i/-ı/-u/-ü.'],ex:['evin kapısı (the door of the house)','Ali’nin evi','masanın üstü']},
{t:['My: -im / -ım / -um / -üm','ملكيتي: -im / -ım / -um / -üm'],b:['Add a four-way suffix with m. After a vowel just add -m: ev → evim, masa → masam, anne → annem.','نضيف لاحقة رباعية مع m. وبعد حرف العلة نضيف -m فقط: ev ← evim و masa ← masam و anne ← annem.'],ex:['evim','masam','annem','kitabım']}];

/* culture notes: one sentence per unit (units without their own note get a general one) */
const CULT={
greet:['Turks say “Geçmiş olsun” (may it pass) to anyone who is ill, had bad luck or a hard day.','يقول الأتراك «Geçmiş olsun» (ليمرّ ذلك) لكل من مرض أو أصابه سوء حظ أو مرّ بيوم صعب.'],
intro:['People often add “abla” or “abi” after a first name as a friendly, respectful way to address someone older.','يضيف الأتراك غالباً «abla» أو «abi» بعد الاسم الأول كطريقة ودودة ومحترمة لمخاطبة من هو أكبر سناً.'],
fam:['Calling an older neighbour “teyze” (aunt) or “amca” (uncle) is normal even if you are not related.','من المعتاد أن تنادي جارة أكبر منك «teyze» (خالة) أو جاراً «amca» (عم) حتى لو لم تكن بينكم قرابة.'],
food:['Tea is served in small tulip-shaped glasses, and offering it is a basic sign of hospitality.','يُقدَّم الشاي في أكواب صغيرة على شكل التوليب، وتقديمه علامة أساسية على الضيافة.'],
place:['Istanbul is built on two continents: Europe and Asia face each other across the Bosphorus.','إسطنبول مبنية على قارتين: أوروبا وآسيا تتقابلان عبر البوسفور.'],
daily:['Many people enjoy a long Turkish breakfast with cheese, olives, tomatoes, eggs and endless tea.','يستمتع كثيرون بفطور تركي طويل مع الجبن والزيتون والطماطم والبيض والكثير من الشاي.'],
shop:['Prices are fixed in most shops, but bargaining is expected in bazaars.','الأسعار ثابتة في معظم المتاجر، لكن المساومة متوقعة في الأسواق الشعبية.'],
health:['After a sneeze people say “Çok yaşa” (live long).','بعد العطاس يقول الناس «Çok yaşa» (عِش طويلاً).'],
ist:['For many people in Istanbul a ferry across the Bosphorus is part of the daily commute.','بالنسبة لكثير من سكان إسطنبول، عبور البوسفور بالباخرة جزء من الذهاب اليومي إلى العمل.'],
hotel:['Hotels and shops often welcome guests with tea or Turkish coffee.','كثيراً ما ترحّب الفنادق والمتاجر بالضيوف بالشاي أو القهوة التركية.'],
animal:['Istanbul is famous for its street cats and dogs, which neighbours feed and look after.','تشتهر إسطنبول بقططها وكلابها في الشوارع التي يطعمها الجيران ويعتنون بها.'],
fruit:['Fresh fruit and vegetables are bought at weekly neighbourhood markets called “pazar”.','تُشترى الفواكه والخضروات الطازجة من أسواق الأحياء الأسبوعية التي تسمى «pazar».'],
polite:['On holidays young people kiss an elder’s hand and touch it to their forehead as a sign of respect.','في الأعياد يقبّل الشباب يد الكبار ويضعونها على جبينهم احتراماً.'],
work:['In many offices tea is brought around in the afternoon, often by a “çaycı”.','في كثير من المكاتب يُوزَّع الشاي بعد الظهر، غالباً عن طريق «çaycı».'],
trouble:['112 is the single emergency number in Turkey.','الرقم 112 هو رقم الطوارئ الموحّد في تركيا.'],
idiom:['A famous proverb says a cup of coffee is remembered for forty years.','يقول مثل مشهور إن فنجان القهوة يُتذكَّر أربعين سنة.'],
cult:['Bayram means holiday: Ramazan Bayramı and Kurban Bayramı are the two big religious holidays, when families visit each other.','Bayram تعني العيد: عيد الفطر وعيد الأضحى هما العيدان الدينيان الكبيران، وفيهما تزور العائلات بعضها.'],
simit:['Simit sellers are everywhere in Istanbul; a simit with tea is a classic quick breakfast.','باعة السميت في كل مكان في إسطنبول، والسميت مع الشاي فطور سريع كلاسيكي.'],
kart:['One İstanbulkart works on the metro, tram, bus, Marmaray and ferry.','بطاقة إسطنبول كارت الواحدة تعمل في المترو والترام والحافلة ومرمراي والباخرة.'],
trans:['In a dolmuş you pass your fare forward and say “İnecek var!” when you want to get off.','في الدولموش تمرّر أجرتك إلى الأمام وتقول «İnecek var!» عندما تريد النزول.'],
bazaar:['The Grand Bazaar dates from the 15th century and has thousands of shops.','يعود تاريخ الكابالي تشارشي إلى القرن الخامس عشر ويضم آلاف المحلات.'],
kadikoy:['Kadıköy, on the Asian side, is known for its food market, cafés and ferry pier.','قاضي كوي على الجانب الآسيوي معروفة بسوق الطعام والمقاهي ورصيف الباخرة.'],
pharm:['Every night one pharmacy in each area stays open: the “nöbetçi eczane” (duty pharmacy).','كل ليلة تبقى صيدلية واحدة مفتوحة في كل منطقة: «nöbetçi eczane» (الصيدلية المناوبة).']};
const CULT_GEN=[
['Istanbul was the capital of the Roman, Byzantine and Ottoman empires.','كانت إسطنبول عاصمة الإمبراطوريات الرومانية والبيزنطية والعثمانية.'],
['Turkish coffee is boiled in a small pot called a “cezve” and served with a glass of water.','تُغلى القهوة التركية في إبريق صغير يسمى «cezve» وتُقدَّم مع كوب من الماء.'],
['“Balık ekmek” (a fish sandwich) by the water at Eminönü is a classic street food.','«Balık ekmek» (ساندويتش السمك) على الساحل في أمينونو من أشهر أطعمة الشارع.'],
['People say “Afiyet olsun” (enjoy your meal) to anyone who is eating, even a stranger.','يقول الناس «Afiyet olsun» (بالهناء والعافية) لكل من يأكل، حتى لو كان غريباً.'],
['The “nazar boncuğu” (evil-eye bead) hangs in homes and shops to protect against bad luck.','تُعلَّق «nazar boncuğu» (خرزة العين) في البيوت والمحلات للحماية من سوء الحظ.'],
['Istanbul is said to have seven hills, like Rome, and every neighbourhood has its own character.','يُقال إن لإسطنبول سبع تلال مثل روما، ولكل حي طابعه الخاص.']];
const cultNote=(u,i)=>{const n=CULT[u.id]||CULT_GEN[(i||0)%CULT_GEN.length];return LC()=='ar'?n[1]:n[0]};
Object.assign(window,{STORIES,DIALOGS,GRAM,CULT,CULT_GEN,cultNote});
})();
