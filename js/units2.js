/* ===== Real-life Istanbul scenario units (A2). Loaded after lessons.js, before extra.js. Original phrases. ===== */
(function(){
const NEW=[
{id:"simit",icon:"🥨",title:"At the Simit Stand",lvl:"A2",tip:"Politeness: add 'lütfen' (please) and use 'olsun' to say how you want it: peynirli olsun = with cheese, please.",
 items:[["Bir simit, lütfen","One simit, please"],["Simit ne kadar?","How much is a simit?"],["Sıcak mı?","Is it hot?"],["Yanında çay alabilir miyim?","Can I get tea with it?"],["Peynirli olsun","With cheese, please"],["Para üstü kalsın","Keep the change"]],
 ar:["سميت واحد من فضلك","بكم السميت؟","هل هو ساخن؟","هل يمكنني أن آخذ شاياً معه؟","مع الجبن من فضلك","خذ الباقي"],
 mt:["عند بائع السميت","للتهذيب أضف «lütfen» (من فضلك) واستخدم «olsun» لتقول ما تريد: peynirli olsun = مع الجبن من فضلك."]},
{id:"kart",icon:"🪪",title:"Buying an İstanbulkart",lvl:"A2",tip:"-mak istiyorum = I want to (do something): almak istiyorum = I want to buy.",
 items:[["İstanbulkart almak istiyorum","I would like to buy an İstanbulkart"],["Kartı nereden alabilirim?","Where can I buy the card?"],["Kartıma para yüklemek istiyorum","I want to top up my card"],["Kaç lira yükleyeyim?","How many liras should I load?"],["Bakiyem ne kadar?","What is my balance?"],["Kartım çalışmıyor","My card isn't working"]],
 ar:["أريد أن أشتري بطاقة إسطنبول كارت","من أين يمكنني شراء البطاقة؟","أريد شحن بطاقتي","كم ليرة أشحن؟","كم رصيدي؟","بطاقتي لا تعمل"],
 mt:["شراء إسطنبول كارت","-mak istiyorum = أريد أن (أفعل شيئاً): almak istiyorum = أريد أن أشتري."]},
{id:"trans",icon:"🚇",title:"Marmaray, Ferry & Dolmuş",lvl:"A2",tip:"Question word 'nereden' = from where; 'nereye' = to where.",
 items:[["Marmaray nereden kalkıyor?","Where does the Marmaray leave from?"],["Bir sonraki vapur kaçta?","When is the next ferry?"],["Kadıköy'e iki bilet","Two tickets to Kadıköy"],["Dolmuş nereye gidiyor?","Where does the dolmuş go?"],["Müsait yer var mı?","Is there a free seat?"],["İnecek var!","Someone wants to get off!"]],
 ar:["من أين يتحرك مرمراي؟","متى الباخرة القادمة؟","تذكرتان إلى قاضي كوي","إلى أين يذهب الدولموش؟","هل يوجد مقعد فارغ؟","يوجد من سينزل!"],
 mt:["مرمراي والباخرة والدولموش","كلمة السؤال «nereden» = من أين؛ «nereye» = إلى أين."]},
{id:"bazaar",icon:"💍",title:"Grand Bazaar Bargaining",lvl:"A2",tip:"-ar mısınız? / -er misiniz? is a polite request: indirim yapar mısınız? = could you give a discount?",
 items:[["Bu kaç lira?","How many liras is this?"],["Çok pahalı, indirim yapar mısınız?","Too expensive, can you give a discount?"],["Son fiyat ne?","What is the final price?"],["Biraz düşünüyorum","I am thinking about it a bit"],["Başka renk var mı?","Is there another colour?"],["Tamam, alıyorum","Okay, I'll take it"]],
 ar:["كم ليرة هذا؟","غالٍ جداً، هل يمكنك تخفيض السعر؟","ما السعر النهائي؟","أفكر قليلاً","هل يوجد لون آخر؟","حسناً، سآخذه"],
 mt:["المساومة في الكابالي تشارشي","-ar mısınız? / -er misiniz? طلب مهذب: indirim yapar mısınız? = هل يمكنك عمل خصم؟"]},
{id:"kadikoy",icon:"🧭",title:"Directions in Kadıköy",lvl:"A2",tip:"Directions end in -n for polite commands: dönün = turn, gidin = go.",
 items:[["Kadıköy iskelesi nerede?","Where is the Kadıköy pier?"],["Düz gidin","Go straight"],["İkinci sokaktan sola dönün","Turn left at the second street"],["Çok uzak mı?","Is it very far?"],["Yürüyerek on dakika","Ten minutes on foot"],["Haritada gösterir misiniz?","Could you show me on the map?"]],
 ar:["أين رصيف قاضي كوي؟","اذهب مباشرة","انعطف يساراً عند الشارع الثاني","هل هو بعيد جداً؟","عشر دقائق مشياً","هل يمكنك أن تريني على الخريطة؟"],
 mt:["السؤال عن الاتجاهات في قاضي كوي","أفعال الأمر المهذبة تنتهي بـ -n: dönün = انعطف، gidin = اذهب."]},
{id:"pharm",icon:"💊",title:"At the Pharmacy",lvl:"A2",tip:"Body complaints use the possessive: başım ağrıyor = my head hurts (literally 'my head aches').",
 items:[["Midem ağrıyor","I have a stomachache"],["Ağrı kesici var mı?","Do you have painkillers?"],["Reçetem var","I have a prescription"],["Günde kaç defa içeceğim?","How many times a day do I take it?"],["Yemekten önce mi sonra mı?","Before or after meals?"],["Nöbetçi eczane nerede?","Where is the duty pharmacy?"]],
 ar:["عندي ألم في المعدة","هل يوجد مسكّن للألم؟","معي وصفة طبية","كم مرة في اليوم أتناوله؟","قبل الأكل أم بعده؟","أين الصيدلية المناوبة؟"],
 mt:["في الصيدلية","الشكوى من الجسم تستخدم صيغة الملكية: başım ağrıyor = رأسي يؤلمني (حرفياً «رأسي يتألم»)."]}
];
const at=UNITS.findIndex(u=>u.id==='clock')+1;                     // after the last A2 unit, before B1
UNITS.splice(at>0?at:UNITS.length,0,...NEW.map(({ar,mt,...u})=>u));
NEW.forEach(n=>{(TRANS.ar=TRANS.ar||{})[n.id]=n.ar;(META.ar=META.ar||{})[n.id]=n.mt});
})();
