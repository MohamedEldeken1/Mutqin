# -*- coding: utf-8 -*-
"""
Populate all 60 stories (30 Arabic and 30 English) for Mutqan Platform.
Sourced directly from the official initiative syllabus:
مبادرة «مُتقن» — برنامج حذق — مبادرات الملهم التربوي / إتقان التربية
"""
import sqlite3
import os
from database import DB_PATH

ARABIC_STORIES = [
    {
        "num": 1,
        "title": "صانع الساعات الأمين",
        "value": "الإتقان والأمانة في العمل",
        "content": """في رحاب ورشة الساعات العتيقة في قلب المدينة القديمة، حيث تتعانق نسائم الصباح مع عبق الأصالة والجمال، بدأت فصول هذه الحكاية الملهمة التي نسجت خيوطها حول قيمة الإتقان والأمانة في العمل. عُرف مازن بين أقرانه بنباهته وحبه للاستطلاع، إذ كان يتأمل تفاصيل الأشياء من حوله باحثاً عن سر تميزها وخلودها. ومع ذلك، كان يواجه أحياناً حيرة حين تتزاحم أمامه المهام أو تعترض سبيله العقبات التي تتطلب بصيرة نافذة.

وفي ذات يوم مشرق، التقى مازن بقدوته وموجهه العم محمود، الذي عُرف في أنحاء المكان برجاحة عقله وطول خبرته وحكمته البالغة. كان العم محمود يتأمل ساعة جيب ذهبية نادرة بعين الخبير الفاحص، ثم التفت إلى مازن بابتسامة هادئة وقال له بصوت رخيم يملؤه الوقار: «يا بني، إن الناس ينظرون غالباً إلى المظاهر البراقة والنتائج السريعة، لكن السر الحقيقي يكمن في الباطن، وفي مدى التزام المرء بقيمة الإتقان والأمانة في العمل حين يخلو بعمله وضميره». توقفت هذه الكلمات في ذهن مازن طويلاً، وشعر بأنها تفتح أمامه أفقاً جديداً لم يكن يدركه من قبل.

دارت الأيام، وجاءت اللحظة التي وُضع فيها مازن أمام اختبار حقيقي يترجم الأقوال إلى أفعال. فبينما كان متواجداً في ورشة الساعات العتيقة في قلب المدينة القديمة، برزت أمامه مهمة دقيقة ترتبط ارتباطاً وثيقاً بـ ساعة جيب ذهبية نادرة. للوهلة الأولى، بدا الأمر يسيراً يمكن إنجازه على عجل أو الاكتفاء فيه بالحد الأدنى الذي يرضي الناظرين، بل إن بعض من حوله أشاروا عليه باختصار الطريق وتوفير الجهد، قائلين إن أحداً لن يدقق في التفاصيل الخفية أو يسأل عما وراء الظاهر.

وقف مازن بين خيارين لا ثالث لهما: إما أن يسلك الطريق السهل السريع الذي يخلو من التعب ولكنه يفتقر إلى الجودة والصدق، وإما أن يرتقي بنفسه إلى مقام الإتقان والحذق فيتحمل المشقة في سبيل إخراج العمل على أكمل وجه. تذكر حينها نظرات العم محمود وكلماته العميقة عن الإتقان والأمانة في العمل، وشعر بنداء داخلي يحثه على الثبات وعدم التنازل عن المبادئ النبيلة مهما كلفه ذلك من وقت وعناء.

حسم مازن أمره بعزيمة لا تلين، وشرع في العمل بهمة عالية وإخلاص صادق. فقام بإصلاح الترس الخفي بدقة متناهية رغم عدم رؤية العميل له، مستعيناً بالصبر والتأني، ومطبقاً كل ما تعلمه من أصول المهارة والحذق. كانت الساعات تمضي وهو منكب على مهمته في ورشة الساعات العتيقة، يراجع كل خطوة بدقة، ويصلح كل خلل مهما صغر حجمه، حتى تكلل جهده بالنجاح وأبصر ساعة جيب ذهبية نادرة في أبهى حلة وأتقن صورة.

وعندما عُرض الأمر أمام الجميع وحضر العم محمود ليرى النتيجة، ساد صمت مهيب أعقبه إعجاب شديد بما أنجزه مازن. اقترب العم محمود وتفحص العمل عن كثب، فأدرك بفطنته حجم الجهد المبذول في التفاصيل الدقيقة التي لا يراها إلا أهل الخبرة والبصيرة. وضع يده على كتف مازن فخوراً به وقال أمام الحاضرين: «هذا هو ثمرة الإتقان والأمانة في العمل، وهكذا يصنع المخلصون مجدهم بأيديهم وعقولهم النيرة».

الحكمة المستخلصة والدرس التربوي: إن الله يحب إذا عمل أحدكم عملاً أن يتقنه، فالإتقان شرف الصانع وأمانة الضمير.""",
        "questions": "١. كيف تجلت قيمة «الإتقان والأمانة في العمل» في الموقف الذي واجهه مازن؟\n٢. لو كنت مكان مازن في ورشة الساعات العتيقة، ما الإجراء الإضافي الذي كنت ستتخذه لتعزيز الإتقان؟\n٣. استخرج من القصة ثلاث مفردات فصيحة ووظفها في جمل مفيدة تعبر عن روح مبادرة مُتقن."
    },
    {
        "num": 2,
        "title": "بذرة الصبر الذهبية",
        "value": "الصبر والمثابرة",
        "content": """تحت سماء صافية تظلل بستان النخيل الأخضر على أطراف القرية، كانت الحياة تسير بإيقاع هادئ يحمل في طياته دروساً عظيمة لمن يتأمل في جوهر الصبر والمثابرة. نشأ ريان على حب الخير والسعي نحو الكمال، وكان يتطلع بشغف إلى اليوم الذي يثبت فيه جدارته ومهارته. لكنه سرعان ما أدرك أن الوصول إلى القمة يمر عبر مسالك دقيقة تحتاج إلى صبر ومهارة وحذق.

وفي ذات يوم مشرق، التقى ريان بقدوته وموجهه الجد صالح. كان الجد صالح يتأمل فسيلة نخل صغيرة بعين الخبير الفاحص، وقال لريان: «يا بني، إن الناس ينظرون غالباً إلى المظاهر البراقة والنتائج السريعة، لكن السر الحقيقي يكمن في الباطن، وفي مدى التزام المرء بقيمة الصبر والمثابرة حين يخلو بعمله وضميره».

حسم ريان أمره وشرع في رعاية الفسيلة يوماً بعد يوم دون استعجال الثمر حتى اشتد عودها، مستعيناً بالصبر والتأني. كانت الساعات تمضي وهو منكب على مهمته، يسقيها وينظف تربتها ويحميها من الرياح العاتية، حتى تكلل جهده بالنجاح وأبصر فسيلة نخل صغيرة في أبهى حلة وأتقن صورة.

الحكمة المستخلصة والدرس التربوي: الثمار العظيمة تحتاج إلى جذور عميقة لا تُبنى إلا بالصبر وطول النفس.""",
        "questions": "١. كيف تجلت قيمة «الصبر والمثابرة» في رعاية الفسيلة؟\n٢. ما الفرق بين العمل المتعجل والعمل المتقن الصبور؟"
    },
    {
        "num": 3,
        "title": "مكتبة الحكمة المفقودة",
        "value": "حب القراءة والبحث عن المعرفة",
        "content": """في المكتبة العامة الكبرى ذات القباب العالية، تجلت معاني حب القراءة والبحث عن المعرفة في أبهى صورها. كانت ليلى شابة متقدة الذهن شغوفة بالتعلم، تسعى لترك أثر طيب. التقت بموجهتها الأستاذة مريم التي كانت تفحص مخطوطة تاريخية قديمة، وألهمتها بأن العلم كنز يستحق العناء.
قامت ليلى بالبحث الدؤوب في فهارس الكتب وترميم الأوراق المتآكلة لاستخراج المعرفة النافعة بإتقان وصبر حتى أتمت فهرس المخطوطة النادرة.
الحكمة المستخلصة: العلم كنز لا يفنى، والقراءة مفتاح العقول النيرة التي تبني الحضارات.""",
        "questions": "١. ما الدور الذي لعبته القراءة في توسيع مدارك ليلى؟\n٢. كيف تساهم الكتب في حفظ تراث الأمم وبناء مستقبلها؟"
    },
    {
        "num": 4,
        "title": "جسر التعاون",
        "value": "العمل الجماعي وتوحيد الجهود",
        "content": """في وادي النهر الفاصل بين القريتين، وقف المهندس طارق ليوجه أهل القرية نحو بناء جسر متين يربط الضفتين. قام بتوزيع الأدوار بين البنائين والنجارين والشباب لإتمام الجسر قبل موسم الأمطار، وبرهن الجميع على أن يد الله مع الجماعة، وما يعجز عنه الفرد وحده يتحقق بتكاتف الجميع.""",
        "questions": "١. كيف ساعد توزيع المهام على إنجاز الجسر بدقة وسرعة؟\n٢. اذكر موقفاً في مدرستك احتجت فيه للتعاون مع زملائك."
    },
    {
        "num": 5,
        "title": "رسام الأمل",
        "value": "التفاؤل وإلهام الآخرين",
        "content": """في مرسم المدرسة المطل على الحديقة، تعرضت لوحة سلمى لحادث بسقوط بقعة لونية داكنة على منتصف القماش. بدلاً من الاستسلام لليأس، استلهمت نصيحة الفنان كريم وحولت البقعة بإتقان إلى شجرة مزهرة نابضة بالحياة وحلق حولها طيور مبهجة.
الحكمة: الأخطاء ليست نهاية الطريق، بل هي بداية لإبداع جديد لمن يملك عيناً متفائلة.""",
        "questions": "١. كيف حولت سلمى التحدي والخطأ إلى فرصة نجاح؟\n٢. ما هو أثر التفاؤل على إنجاز الأعمال وإتقانها؟"
    },
    {
        "num": 6,
        "title": "حارس الأمانة",
        "value": "الصدق ورد الأمانات",
        "content": """في سوق التجار القديم، وجد ياسر صرة نقود مفقودة ممتلئة بالدنانير. على الرغم من حاجته، ظل يبحث عن صاحب الصرة ثلاثة أيام كاملة حتى اهتدى إليه وأعادها كاملة دون نقصان، فضرب أروع الأمثلة في الصدق وأمانة الضمير.
الحكمة: الأمانة تاج على رؤوس الأوفياء، وبها تحفظ الحقوق وتسمو النفوس.""",
        "questions": "١. ما هو شعور ياسر الداخلي بعد رد الأمانة لأهلها؟\n٢. لماذا يعد الصدق ركيزة أساسية في بناء مجتمع متراحم؟"
    },
    {
        "num": 7,
        "title": "قطرة ماء تروي صحراء",
        "value": "ترشيد الاستهلاك وحفظ النعم",
        "content": """في واحة الصحراء، لاحظ خالد تسرباً صغيراً في قناة الري الفخارية الرئيسية. بمساعدة العم راشد، سارع لسد الشقوق الصغيرة بإحكام لحفظ كل قطرة ماء ثمينة تروي المزروعات وتحمي المحصول من الجفاف.
الحكمة: النعم تدوم بالشكر وحسن التدبير، وأعظم الأنهار تبدأ بقطرة ماء واحدة.""",
        "questions": "١. كيف يمثل حفظ الماء تطبيقاً لمفهوم الإتقان في الحياة اليومية؟\n٢. اقترح وسيلتين لترشيد استهلاك الماء في مدرستك."
    },
    {
        "num": 8,
        "title": "قنديل العلم",
        "value": "احترام المعلم وتقدير العلم",
        "content": """في حلقات الدرس في المدرسة العريقة، كان عمر يحرص على تدوين الفوائد العلمية بدقة ومساعدة زملائه في استيعاب المسائل الصعبة، مقتدياً بتواضع وأدب شيخه الوقور زيد.
الحكمة: من تواضع للعلم ناله، ومن وقر معلمه بورك له في علمه وعمله.""",
        "questions": "١. ما واجب الطالب تجاه معلمه وزملائه في الصف؟\n٢. كيف يقود احترام العلم إلى التميز الأكاديمي والمهاري؟"
    },
    {
        "num": 9,
        "title": "الكلمة الطيبة",
        "value": "حسن الخلق وطيب الكلام",
        "content": """في حديقة الحي، استخدمت سارة الكلمات الرقيقة والأسلوب الحكيم لإصلاح سوء التفاهم والنزاع بين صديقاتها، فجمعت الشمل وزرعت المحبة في القلوب.
الحكمة: الكلمة الطيبة كالشجرة الطيبة، أصلها ثابت وفرعها في السماء تثمر خيراً ومودة.""",
        "questions": "١. ما أثر الكلام الطيب على علاقات الزملاء في الفصل؟\n٢. استشهد بحديث نبوي شريف يحث على الكلمة الطيبة."
    },
    {
        "num": 10,
        "title": "تاج البر والوفاء",
        "value": "بر الوالدين والإحسان إليهما",
        "content": """في منزل العائلة الهادئ، بادر حسان بالسهر على راحة والده المريض وتقديم دوائه في مواعيده وقضاء حوائجه بابتسامة ورضا تام، معتبراً خدمة الوالدين أعظم أبواب التوفيق.
الحكمة: بر الوالدين طريق السعادة في الدنيا والآخرة، وبه تتنزل الرحمات والبركات.""",
        "questions": "١. كيف يكون الإتقان في بر الوالدين والإحسان إليهما؟\n٢. اذكر عملاً تقوم به يومياً لإدخال السرور على والديك."
    },
    {
        "num": 11,
        "title": "المخترع الصغير",
        "value": "الإبداع والتفكير العلمي",
        "content": """في مختبر العلوم المدرسي، عكف زياد على ابتكار نموذج طاحونة هوائية لتوليد الطاقة. أجرى المحاولة خمس عشرة مرة بعد كل إخفاق، يدون الملاحظات ويصحح زوايا الشفرات حتى دارت الطاحونة بنجاح وأنارت المصباح.
الحكمة: النجاح العلمي وليد التجربة والمثابرة، وليس هناك فشل بل خطوات نحو الحل.""",
        "questions": "١. ما أهمية التفكير العلمي وتكرار التجربة عند مواجهة الصعاب؟\n٢. كيف ساعد شغف زياد في وصوله إلى الاختراع المنشود؟"
    },
    {
        "num": 12,
        "title": "نداء الشهامة",
        "value": "إغاثة الملهوف ومساعدة الضعفاء",
        "content": """في طريق جبلي وعر، صادف فارس مسافراً تعطلت مركبته ونفد زاده ومائه. لم يتردد في إيقاف رحلته وتقديم الإسعافات الأولية واقتسام زاده معه حتى عاد آمناً.
الحكمة: المروءة والشهامة خلقان كريمان يرفعان قدر الإنسان في الأرض والسماء.""",
        "questions": "١. صف تصرف فارس النبيل وما يدل عليه من شيم أصيلة.\n٢. كيف نغرس شهامة إغاثة المحتاجين في مجتمعنا المدرسي؟"
    },
    {
        "num": 13,
        "title": "كنز الوقت",
        "value": "تنظيم الوقت واستثمار العمر",
        "content": """في نادي الفروسية والرياضة، وضع باسم جدولاً يومياً دقيقاً يقسم فيه ساعاته بين أداء الصلاة والدراسة الجادة والتدريب البدني ومساعدة أسرته، فحقق الصدارة في دراسته وناديه.
الحكمة: الوقت هو الحياة، ومن أحسن إدارة دقائقه ملك زمام مستقبله ونجاحه.""",
        "questions": "١. كيف يساعد تنظيم اليوم في إتقان المذاكرة وممارسة الهوايات؟\n٢. ما هي العادات التي تهدر الوقت وكيف نتجنبها؟"
    },
    {
        "num": 14,
        "title": "مرآة التواضع",
        "value": "التواضع ونبذ الغرور",
        "content": """في ميناء السفن الشراعية، أنصت وليد لنصيحة بحار عجوز بسيط حول التيارات البحرية وتغير الرياح بدلاً من التكبر بخبرته القليلة، فنجت السفينة من عاصفة هوجاء.
الحكمة: الحكمة ضالة المؤمن، والتواضع يرفع صاحبه بينما الغرور يعمي البصيرة.""",
        "questions": "١. كيف يحمي التواضع الإنسان من الوقوع في الأخطاء الجسيمة؟\n٢. قارن بين الثقة بالنفس والغرور المدمر."
    },
    {
        "num": 15,
        "title": "شجرة العطاء",
        "value": "الكرم والجود والإيثار",
        "content": """في مزرعة الزيتون المباركة، اعتاد أنس أن يخصص أفضل ثمار المحصول للفقراء والمحتاجين من أهل قريته قبل نقله للبيع، فشهد محصوله بركة ونماءً مضاعفاً كل عام.
الحكمة: ما نقص مال من صدقة، والعطاء يبارك في الرزق ويشرح الصدر بالمسرة.""",
        "questions": "١. ما هي ثمار الجود والإيثار على الفرد والمجتمع؟\n٢. كيف يؤثر العطاء في صفاء الروح وسعادتها؟"
    },
    {
        "num": 16,
        "title": "فارس العدل",
        "value": "العدل والإنصاف في الحكم",
        "content": """في مجلس الصلح بالقرية، استمع حمزة لحجج المتخاصمين بروية وتجرد تام، وأنصف الطرف الأضعف وأعطاه حقه كاملاً رغم أن الخصم كان قريباً له، مؤثراً الحق والعدل.
الحكمة: العدل أساس الملك وعماد العمران، وبه تطمئن القلوب وتستقيم موازين الحياة.""",
        "questions": "١. لماذا يعد الإنصاف والعدل مقياساً لقوة الشخصية وأمانتها؟\n٢. كيف تطبق العدل بين زملائك أثناء اللعب أو الأنشطة المدرسية؟"
    },
    {
        "num": 17,
        "title": "درع الشجاعة الأدبية",
        "value": "الاعتراف بالخطأ وتحمل المسؤولية",
        "content": """أثناء اللعب في فناء المدرسة، كسر معاذ زجاج نافذة المكتبة دون قصد. بدلاً من التواري، توجه مباشرة لمدير المدرسة واعترف بمسؤوليته الكاملة وعرض المساعدة في إصلاحها.
الحكمة: الاعتراف بالحق فضيلة، والشجاعة الحقيقية أن تواجه خطأك وتصلحه بكرامة.""",
        "questions": "١. ما الشجاعة الأدبية وكيف تميز بينها وبين التهور؟\n٢. كيف قابل المدير صدق معاذ وتحمله للمسؤولية؟"
    },
    {
        "num": 18,
        "title": "نسج الحذق",
        "value": "الحذق والمهارة في الصناعة",
        "content": """في معمل النسيج الحريري، كان بلال يطرز سجادة مزخرفة. حين لاحظ خللاً بسيطاً في نسج خيط واحد في الزاوية، أعاد فك ثلاثة صفوف وإصلاحها بإتقان وحذق بالغين ليكون العمل كاملاً.
الحكمة: الحذق في الصنعة يجمع بين جمال الشكل ومتانة الجوهر، ولا يرضى بالحلول الوسط.""",
        "questions": "١. ما معنى 'الحذق' وكيف يرتبط بمفهوم الإتقان في مبادرتنا؟\n٢. لماذا يرفض صاحب الحذق تجاهل الأخطاء الصغيرة؟"
    },
    {
        "num": 19,
        "title": "وفاء العهد",
        "value": "الوفاء بالوعد والالتزام بالمواثيق",
        "content": """مع انطلاق قافلة التجارة، تعهد سعيد بتسليم وثيقة أمانة في الموعد المحدد. رغم اشتداد الرياح والبرد القارس، واصل المسير ولم يستسلم للراحة حتى سلم الأمانة في ساعتها الموعودة.
الحكمة: وعد الحر دين عليه، والوفاء بالعهد سمة الأوفياء وركيزة الثقة بين الناس.""",
        "questions": "١. كيف يبني الوفاء بالوعد مكانة مرموقة للإنسان بين أقرانه؟\n٢. اذكر وعداً قطعته على نفسك في بداية هذا الفصل الدراسي والتزمت به."
    },
    {
        "num": 20,
        "title": "حكاية رغيف الخبز",
        "value": "تقدير العمل اليدوي واحترام الحرف",
        "content": """في فرن الحارة التراثي، شارك مروان الخباز أبو طلال مراحل إنتاج الخبز من حصاد القمح وطحنه وعجنه وخبزه تحت لهيب الفرن، فأدرك قيمة كل لقمة وعظمة سواعد العمال.
الحكمة: كل لقمة نأكلها هي ثمرة جهد جبين متعب يستحق منا وافر التقدير والاحترام.""",
        "questions": "١. كيف غرس العمل اليدوي في نفس مروان احترام كل عامل وصانع؟\n٢. ما أهمية تقدير النعم والجهود المبذولة لخدمتنا؟"
    },
    {
        "num": 21,
        "title": "واحة التسامح",
        "value": "العفو عند المقدرة والتسامح",
        "content": """في مجلس الحي، تعرض تامر لإساءة كلامية غير مبررة من أحد جيرانه. عندما سنحت له الفرصة للرد بالمثل، قابل الإساءة بالصفح والابتسامة وأهدى جاره طبقا من الفاكهة، فاستحال العداء صداقة حميمة.
الحكمة: التسامح يغسل القلوب من الضغائن، والعفو عند المقدرة من شيم الكرام.""",
        "questions": "١. كيف يرفع التسامح صاحبه درجات في أعين الناس؟\n٢. اذكر أثراً إيجابياً للعفو في صفاء النفس والبيئة الصفية."
    },
    {
        "num": 22,
        "title": "بوصلة الهدف",
        "value": "تحديد الأهداف وعلو الهمة",
        "content": """أثناء تسلق قمة الجبل الأخضر، حدد غسان مساره بدقة عبر الخريطة والبوصلة. وتجاهل أصوات التثبيط والتعب المرحلي، وركز نظره على القمة الشامخة حتى رفع راية الوصول بإتقان.
الحكمة: صاحب الهمة العالية لا يرضى بالدون، ومن حدد هدفه هانت عليه المشاق.""",
        "questions": "١. ما هي أهدافك الشخصية في القراءة لهذا الفصل الدراسي؟\n٢. كيف تحافظ على تركيزك واجتهادك حتى تحقيق هدفك؟"
    },
    {
        "num": 23,
        "title": "صوت الطبيعة",
        "value": "الحفاظ على البيئة والرفق بالكائنات",
        "content": """في المحمية الطبيعية، بادر دانا بإنقاذ طائر مصاب وتضميد جناحه، ثم قاد فريقاً من أصدقائه لتنظيف الغابة من المخلفات البلاستيكية وغرس شتلات جديدة لحماية التنوع البيئي.
الحكمة: الأرض أمانة في أعناقنا، والرفق بمخلوقاتها مظهر من مظاهر التحضر والإيمان.""",
        "questions": "١. ما مسؤوليتنا تجاه البيئة والأشجار والطيور من حولنا؟\n٢. اقترح مبادرة بيئية يمكنك تنفيذها مع فصلك المدرسي."
    },
    {
        "num": 24,
        "title": "نور البصيرة",
        "value": "التفكير الناقد والتثبت من الأخبار",
        "content": """في ساحة الحوار، انتشرت إشاعة خاطئة كادت تعكر صفو مسابقة المدرسة. لم يكتف رامي بترديدها كغيره، بل توجه للمصادر الأصلية وتثبت من الحقيقة بالأدلة القاطعة وكشف الزيف بالحجة.
الحكمة: التثبت قبل الحكم يحمي العقول والمجتمعات من الفتن، والعاقل لا يروج لكل ما يسمع.""",
        "questions": "١. كيف يحمينا التفكير الناقد من الانخداع بالإشاعات والأخبار الكاذبة؟\n٢. ما الخطوات التي تتبعها للتأكد من صحة معلومة تقرؤها؟"
    },
    {
        "num": 25,
        "title": "سفينة النجاة",
        "value": "الاعتماد على النفس والثقة بالله",
        "content": """على شاطئ البحر، تعلم عادل مبادئ النجارة وصنع قاربه الخشبي الصغير بيديه وتعلم السباحة وتوجيه المجاديف، متوكلاً على ربه ومعتمداً على كده وتعبه دون أن ينتظر معونة من أحد.
الحكمة: توكل على الله واعمل بيدك، فالسماء لا تمطر ذهباً، والاعتماد على النفس فخر وشرف.""",
        "questions": "١. ما شعور الإنسان حين ينجز عملاً كبيراً بجهده واعتماده على نفسه؟\n٢. كيف تنمي استقلاليتك واعتمادك على ذاتك في دراستك اليومية؟"
    },
    {
        "num": 26,
        "title": "أجنحة الطموح",
        "value": "طلب المعالي وتجاوز الصعاب",
        "content": """في مرصد الفلك، لم يستسلم طارق لضعف الإمكانات وضيق المكان، بل صنع منظاراً فلكياً من عدسات بسيطة ورصد مدارات الكواكب بدقة ليلية متواصلة حتى أصبح باحثاً متميزاً.
الحكمة: الطموح جناح يحلق بالإنسان نحو آفاق المجد، وقلة الإمكانات ليست عائقاً أمام الإرادة.""",
        "questions": "١. كيف قهر طارق التحديات وحول ضعف الإمكانات إلى وقود للنجاح؟\n٢. ما طموحك المستقبلي وكيف تستعد له من الآن؟"
    },
    {
        "num": 27,
        "title": "حديقة الجيران",
        "value": "الإحسان إلى الجار وحفظ حقوقه",
        "content": """لاحظ إياد غياب جاره المسن لمرضه، فقام مع إخوانه بسقاية ورود حديقته وتنظيف ممراته وتزيين سوره بالزهور ليفاجئه عند عودته من المشفى بحديقة مزهرة تسر الناظرين.
الحكمة: الجار قبل الدار، والإحسان إلى الجيران وصية السماء وعنوان المروءة وحسن الجوار.""",
        "questions": "١. كيف تجسد الإحسان في موقف إياد تجاه جاره المسن؟\n٢. اذكر صوراً أخرى لحسن الجوار في حيك السكني."
    },
    {
        "num": 28,
        "title": "مفتاح الفرج",
        "value": "الصبر على البلاء والأمل بالله",
        "content": """عندما حاصرت الثلوج الكثيفة القرية الجبلية وأغلقت المسالك، لم يستسلم ندى لليأس، بل استغل الأيام في نسج أثواب صوفية دافئة وتوزيعها على المحتاجين حتى انقشعت الغمة بحمد الله.
الحكمة: مع العسر يسراً، ومن رحم الشدائد تولد أعظم الفرص لمن امتلأ قلبه بالصبر والأمل.""",
        "questions": "١. كيف حول ندى محنة الحصار بالثلج إلى منحة من العمل والخير؟\n٢. ما أثر حسن الظن بالله في تجاوز الأوقات العصيبة؟"
    },
    {
        "num": 29,
        "title": "قلم الحقيقة",
        "value": "الأمانة العلمية ونسبة الفضل لأهله",
        "content": """في قاعة المؤتمرات العلمية، كُرّم فيصل على فكرة بحثية مميزة. وأمام الحاضرين واللجنة، أعلن بأمانة مطلقة أن الفكرة الأساسية كانت بمشاركة زميله الغائب ورفض أن ينفرد بالتكريم.
الحكمة: الأمانة العلمية شرف الباحث الحقيقي، وبركة العلم في نسبة الفضل والقول لأهله.""",
        "questions": "١. ما هي الأمانة العلمية ولماذا تعد معياراً أساسياً للباحث المتقن؟\n٢. صف شعور زميل فيصل عندما علم بوفائه وأمانته."
    },
    {
        "num": 30,
        "title": "وسام الإتقان",
        "value": "التميز الشامل والحذق في الأداء",
        "content": """في المعرض الختامي السنوي لمبادرة «مُتقن»، قدم نواف مشروعاً متكاملاً عن المدينة الذكية المستدامة، جمع فيه بين الفصاحة اللغوية، والإتقان الهندسي، والروح القيمية العالية، متوجاً رحلة 30 قصة بوسام الإتقان والتميز.
الحكمة: الإتقان ليس مجرد عمل عابر، بل هو أسلوب حياة يصنع القادة والمبدعين ويبني الأوطان.""",
        "questions": "١. كيف يعكس وسام الإتقان جوهر مبادرة «مُتقن» وبرنامج «حذق»؟\n٢. ما هي خطتك لتكون طالباً متقناً في دراستك وقراءتك وسلوكك اليومي؟"
    }
]

ENGLISH_STORIES = [
    {
        "num": 1,
        "title": "The Master Clockmaker's Secret",
        "value": "Excellence & Integrity in Craft",
        "content": """In the cobblestone lane of Oakhaven Clockwork Studio, where the quiet rhythm of daily life carried timeless lessons for those willing to listen, Leo began a journey that would forever define the meaning of excellence & integrity in craft. Known for an eager mind and a sincere desire to excel, Leo often wondered what separated ordinary effort from lasting greatness. Under the thoughtful guidance of Master Arthur, every day offered a new opportunity to observe how patience, character, and dedication shaped the world around them.

The turning point arrived on a crisp morning when Leo was entrusted with a responsibility centered around an eighteenth-century brass pocket watch. At first glance, the task appeared straightforward enough to complete with minimal effort, and passing acquaintances even suggested taking a convenient shortcut. Yet Master Arthur had always reminded Leo that true character is tested not in moments of comfort, but when a person must choose between what is easy and what is right. Faced with this quiet dilemma in the cobblestone lane of Oakhaven Clockwork Studio, Leo paused to reflect on the deeper value of excellence & integrity in craft.

With steady resolve, Leo chose the path of excellence by polishing and calibrating the hidden internal escapement wheel that no customer would ever see. Hour after hour passed in focused dedication as every detail was examined, refined, and perfected with care. When Master Arthur finally returned to inspect the outcome, the remarkable transformation of an eighteenth-century brass pocket watch spoke louder than any boastful words could have. A warm smile of genuine pride crossed Master Arthur's face, recognizing the quiet discipline and integrity woven into every step of the effort. From that day forward, Leo understood that mastery is built through purposeful action.

Moral & Educational Reflection: True mastery lives in the unseen details; integrity is doing right when no one is watching.""",
        "questions": "1. How did Leo demonstrate excellence and integrity with the pocket watch?\n2. Why are unseen details critical in true craftsmanship under the Mutqan philosophy?"
    },
    {
        "num": 2,
        "title": "The Golden Seed of Patience",
        "value": "Patience & Perseverance",
        "content": """In the terraced orchards of Silver Valley, Noah learned the deepest meaning of patience and perseverance. Under the thoughtful guidance of Grandfather Elias, Noah was given a rare mountain cedar sapling to nurture through harsh frosts and parched winds. Rather than seeking quick shortcuts or fast results, Noah faithfully watered the soil, sheltered the tender stem, and waited. Over seasons of unwavering care, the sapling grew into a mighty tree with deep roots that withstood every tempest.
Moral: Greatness takes deep roots before it reaches for the sky; patience turns small efforts into lasting legacies.""",
        "questions": "1. How did Noah show perseverance in caring for the cedar sapling?\n2. What does deep roots represent in our learning journey?"
    },
    {
        "num": 3,
        "title": "The Lantern of Lost Wisdom",
        "value": "Love for Reading & Inquiry",
        "content": """In the Grand Archive of Meridian City, Maya discovered an ancient botanical manuscript that held remedies for forgotten ailments. Guided by Librarian Clara, Maya patiently cross-referenced faded ink pages, translating terms and restoring historical records. Her curiosity revived an educational herb garden that enriched the entire township.
Moral: Knowledge is a lantern that brightens the darkest paths; a curious mind never walks in vain.""",
        "questions": "1. How did Maya's reading habits bring tangible benefits to her community?\n2. Why is research and curiosity vital for young learners?"
    },
    {
        "num": 4,
        "title": "The Bridge Across Willow Creek",
        "value": "Teamwork & Unity",
        "content": """Across the turbulent waters of Willow Creek, youth from two neighboring settlements united under Engineer Marcus. By distributing roles according to each member's talents—measuring timber, chiseling stones, and securing ropes—they completed the crossing ahead of the torrential rains.
Moral: Divided hands build walls, but united hearts build bridges that withstand the fiercest storms.""",
        "questions": "1. What role did cooperation play in completing the bridge?\n2. How do you practice teamwork in your school projects?"
    },
    {
        "num": 5,
        "title": "The Painter of Silver Linings",
        "value": "Optimism & Creative Resilience",
        "content": """In the sunlit conservatory studio, an accidental splash of dark indigo ink threatened to ruin Elena's painting of the four seasons. Inspired by Instructor Julian, she transformed the dark blotch into a breathtaking twilight sky shimmering with guiding stars.
Moral: Mistakes are merely raw materials waiting for a hopeful mind to shape them into beauty.""",
        "questions": "1. How did Elena turn an unexpected mistake into a masterpiece?\n2. What does creative resilience teach us when we encounter setbacks?"
    },
    {
        "num": 6,
        "title": "Guardian of the Merchant's Pouch",
        "value": "Honesty & Trustworthiness",
        "content": """At the crowded Harbor Market, Samir found a leather pouch overflowing with silver coins. Despite personal hardships, he guarded the pouch at the central fountain until dusk, returning every single coin to its rightful owner.
Moral: A clear conscience is worth more than all the gold in the market; honesty is the crown of character.""",
        "questions": "1. Why did Samir choose honesty over personal gain?\n2. How does trustworthiness foster security and peace in society?"
    },
    {
        "num": 7,
        "title": "Every Drop Counts",
        "value": "Stewardship & Conservation",
        "content": """In the desert oasis of Sunstone Springs, Liam detected tiny fissures along the ancient terracotta aqueduct. Working alongside Caretaker Owen, he meticulously sealed each leak with natural stone and clay, ensuring that the oasis survived the sweltering summer.
Moral: Respecting small blessings preserves great abundance; wisdom begins with gratitude and care.""",
        "questions": "1. How does saving small drops lead to saving an entire community?\n2. Name two ways you can conserve resources at home or school."
    },
    {
        "num": 8,
        "title": "The Scholar's Oil Lamp",
        "value": "Respect for Teachers & Learning",
        "content": """In the quiet lecture halls of Oldcrest Academy, Lucas honored his mentor Professor Henrik by diligently recording insights and organizing peer study circles to help classmates who struggled with complex mathematical proofs.
Moral: Knowledge grows when shared with humility, and honoring mentors illuminates the path ahead.""",
        "questions": "1. In what ways did Lucas demonstrate respect for his teacher and peers?\n2. How does helping others reinforce your own learning?"
    },
    {
        "num": 9,
        "title": "Echoes of a Kind Word",
        "value": "Compassion & Gentle Speech",
        "content": """In the school garden, Chloe noticed a harsh misunderstanding dividing two childhood friends. By choosing gentle, compassionate words and listening deeply to both sides, she mended their bond and restored harmony.
Moral: Harsh words bruise the spirit, while gentle words heal hearts and turn strangers into allies.""",
        "questions": "1. How can kind words change an uncomfortable situation into a peaceful one?\n2. What is the power of listening before speaking?"
    },
    {
        "num": 10,
        "title": "The Warmth of Gratitude",
        "value": "Filial Piety & Honoring Parents",
        "content": """In a cozy cottage in Pine Ridge, Caleb devoted himself to caring for his recovering father, preparing nourishing meals and assisting with daily wood carving tasks with cheerful diligence and filial devotion.
Moral: Honoring those who raised us is the noblest debt of love, bringing peace and blessing to every home.""",
        "questions": "1. How did Caleb show practical gratitude towards his father?\n2. What daily acts can express our love and appreciation for our parents?"
    },
    {
        "num": 11,
        "title": "The Young Inventor's Windmill",
        "value": "Scientific Curiosity & Grit",
        "content": """In the school science workshop, Zane analyzed fourteen unsuccessful turbine blade designs in his notebook. He refused to give up, refining the aerofoil angles until the fifteenth prototype lit the generator bulb brightly.
Moral: Failure is not the opposite of success; it is the stepping stone upon which discovery stands.""",
        "questions": "1. Why was Zane's willingness to learn from failure crucial to his success?\n2. How does scientific curiosity drive innovation?"
    },
    {
        "num": 12,
        "title": "A Helping Hand on Alpine Pass",
        "value": "Empathy & Civic Duty",
        "content": """On the icy trails of Alpine Pass, Ethan halted his own championship speed climb to assist a stranded, exhausted hiker, sharing his thermal blanket and emergency rations until help arrived.
Moral: The true measure of strength is how readily we pause our own race to lift someone who has fallen.""",
        "questions": "1. What makes Ethan's decision a true example of civic virtue?\n2. How can we look out for those in need around us?"
    },
    {
        "num": 13,
        "title": "The Hourglass of Purpose",
        "value": "Time Management & Discipline",
        "content": """Balancing rigorous track athletics with demanding academic subjects, Ryan learned from Coach Wallace to schedule his hours with purposeful precision, turning wasted minutes into disciplined progress.
Moral: Time is the coin of life; spend it with intention, and every hour will yield a harvest of growth.""",
        "questions": "1. What strategies helped Ryan achieve balance in his daily life?\n2. How do you manage your time between study and play?"
    },
    {
        "num": 14,
        "title": "The Captain's Brass Compass",
        "value": "Humility & Open-Mindedness",
        "content": """Aboard the coastal schooner Windward, young navigator Iris set aside personal pride to listen to an elderly fisherman's advice about shifting underwater sandbanks, steering the ship safely past dangerous rocks.
Moral: Pride blinds the eyes to danger, while humility listens, learns, and steers safely to harbor.""",
        "questions": "1. Why is humility an essential quality in a leader?\n2. Describe a time when listening to someone else's experience helped you."
    },
    {
        "num": 15,
        "title": "The Olive Grove of Generosity",
        "value": "Generosity & Altruism",
        "content": """In the sun-drenched hills of Verona Grove, Julian set aside the finest bushels of the autumn olive harvest to distribute among needy families before taking any produce to the marketplace.
Moral: A hand that opens to give is always filled with joy; generosity enriches both giver and receiver.""",
        "questions": "1. How does altruism strengthen community ties?\n2. What is the emotional reward of generous giving?"
    },
    {
        "num": 16,
        "title": "The Scales of Fair Play",
        "value": "Justice & Fairness",
        "content": """During the regional youth debate and sports tournament, Owen noticed an unrecorded boundary line touch that gave his team an unfair edge. He immediately reported it to the referee, choosing fairness over an unearned trophy.
Moral: Victory without honor is hollow, whereas standing for fairness wins a respect that never fades.""",
        "questions": "1. Why did Owen value fair play more than winning the game?\n2. How does sportsmanship reflect personal integrity?"
    },
    {
        "num": 17,
        "title": "The Courage to Say Sorry",
        "value": "Accountability & Moral Courage",
        "content": """When a stray soccer kick broke a pane in the school greenhouse, Toby bravely walked into Principal Sterling's office to take responsibility and volunteered his weekend allowance to repair the glass.
Moral: Covering a fault doubles the mistake, while owning it with courage builds unshakable character.""",
        "questions": "1. Why does admitting mistakes require moral courage?\n2. What was the outcome of Toby taking personal accountability?"
    },
    {
        "num": 18,
        "title": "Weaving the Golden Thread",
        "value": "Precision & Mastery (Hadhq)",
        "content": """In the heritage silk workshop, Tariq unraveled three full rows of complex tapestry stitching when he spotted an uneven thread, determined that every weave must meet the highest standard of artistic precision.
Moral: Skillful mastery demands that we never settle for 'good enough' when excellence is within reach.""",
        "questions": "1. What does 'Hadhq' mean in terms of craft and academic work?\n2. How can you apply the golden thread philosophy to your school assignments?"
    },
    {
        "num": 19,
        "title": "A Promise Kept in Winter",
        "value": "Reliability & Keeping Promises",
        "content": """Entrusted with delivering essential medical supplies to an isolated valley clinic, Jonah persevered through heavy snow flurries on foot to keep his word and arrive before twilight.
Moral: A person's word is a sacred bond; reliability turns ordinary actions into pillars of trust.""",
        "questions": "1. Why is keeping promises vital for personal trust?\n2. How does reliability define a mature student?"
    },
    {
        "num": 20,
        "title": "The Baker's Dawn Lesson",
        "value": "Dignity of Labor & Diligence",
        "content": """Working alongside Baker Bernard before sunrise, Milo learned the meticulous patience required for kneading, fermenting, and baking artisan bread, discovering honor in honest manual labor.
Moral: Every honest craft carries quiet dignity; hard work transforms simple grain into daily nourishment.""",
        "questions": "1. What did Milo learn about the value of physical work and discipline?\n2. How should we treat workers and craftsmen who serve our society?"
    },
    {
        "num": 21,
        "title": "The Garden of Forgiveness",
        "value": "Forgiveness & Harmony",
        "content": """To heal a long-standing land dispute between neighboring farms, Adrian planted a lush trellis of fragrant jasmine along the boundary stone, choosing harmony and friendship over bitterness.
Moral: Holding onto anger is like clutching thorns; forgiveness clears the ground for peace to bloom.""",
        "questions": "1. How did Adrian's gesture bring lasting peace between the families?\n2. Why is forgiveness a sign of inner strength rather than weakness?"
    },
    {
        "num": 22,
        "title": "Eyes on the Summit",
        "value": "Goal Setting & Focus",
        "content": """Climbing Mount Hazen, Sora resisted tempting side paths and tiring distractions by setting clear daily checkpoints on his topographic map, successfully reaching the peak in record time.
Moral: A distant summit is conquered one deliberate step at a time by a mind fixed on its purpose.""",
        "questions": "1. How does breaking a large goal into checkpoints help in reaching it?\n2. What is your reading goal in the Mutqan initiative?"
    },
    {
        "num": 23,
        "title": "Voices of the Whispering Woods",
        "value": "Environmental Stewardship",
        "content": """Deep in the Redwood Sanctuary, Hannah helped treat an injured hawk and spearheaded a school cleanup that restored the natural stream and removed harmful plastic waste.
Moral: We do not inherit the earth from our ancestors; we borrow it from the generations yet to come.""",
        "questions": "1. How does protecting nature reflect ethical leadership?\n2. What environmental project could you start in your neighborhood?"
    },
    {
        "num": 24,
        "title": "The Lens of Truth",
        "value": "Critical Thinking & Discernment",
        "content": """When a viral rumor disrupted the school election, student reporter Felix questioned the sensational claims, verified the facts with primary sources, and published the objective truth.
Moral: Wisdom pauses to verify where haste rushes to judge; truth requires a discerning mind.""",
        "questions": "1. Why is it dangerous to accept rumors without proof?\n2. How can young students practice fact-checking in the digital age?"
    },
    {
        "num": 25,
        "title": "Building Your Own Oars",
        "value": "Self-Reliance & Initiative",
        "content": """In Clearwater Bay, Evan crafted his own rowing oars from seasoned ash wood and learned navigation independently, refusing to rely on others when personal effort could accomplish the voyage.
Moral: Dependence waits for favorable winds, but self-reliance builds the oars to reach any shore.""",
        "questions": "1. How does self-reliance boost confidence and independence?\n2. In what areas of study can you take more personal initiative?"
    },
    {
        "num": 26,
        "title": "Stargazer of the Rooftop",
        "value": "Ambition & Overcoming Obstacles",
        "content": """Using an improvised cardboard telescope and hand-polished lenses, Nora meticulously charted binary star movements from her urban rooftop, demonstrating that ambition triumphs over limited means.
Moral: Limited tools cannot confine a limitless vision; ambition turns obstacles into telescopes.""",
        "questions": "1. What enabled Nora to succeed despite having simple equipment?\n2. How can passion help us overcome material hurdles?"
    },
    {
        "num": 27,
        "title": "The Neighbor's Lantern",
        "value": "Kindness to Neighbors & Community",
        "content": """During a bitter winter blackout, Claire delivered homemade soup and solar lamps to elderly residents on Maple Street, clearing snow from their front porches before dawn.
Moral: A strong community is woven from small acts of neighborly care practiced every single day.""",
        "questions": "1. How does neighborly kindness transform a community during crises?\n2. What simple helpful deed can you offer a neighbor this week?"
    },
    {
        "num": 28,
        "title": "Silver Threads in the Storm",
        "value": "Resilience & Hope in Adversity",
        "content": """When an unseasonal blizzard cut off power and supply lines, Lily organized village youth into an artisan wool-knitting cooperative that provided warm garments and uplifted village spirits.
Moral: Adversity tests the spirit, but resilience spins the hardest seasons into threads of strength.""",
        "questions": "1. How did Lily transform an adversity into a communal blessing?\n2. What does resilience mean to you when facing a difficult test?"
    },
    {
        "num": 29,
        "title": "The Citation of Honor",
        "value": "Academic Integrity & Credit",
        "content": """At the National Science Symposium, Jasper received standing ovations for a filtration breakthrough, but he insisted on naming his introverted research partner whose calculations were the true catalyst.
Moral: True scholarship shines brightest when it honors every contributor with honesty and gratitude.""",
        "questions": "1. Why was giving credit to his peer a mark of true educational nobility?\n2. How do you honor academic honesty in homework and projects?"
    },
    {
        "num": 30,
        "title": "The Badge of Mutqan",
        "value": "Holistic Excellence & Leadership",
        "content": """At the Annual Mutqan Excellence Expo, Adam presented his integrated eco-smart city model, blending Arabic rhetorical poise, scientific rigour, and humanitarian values into a masterwork of student achievement.
Moral: Excellence is not a single act, but a lifelong habit of heart, mind, and skillful action.""",
        "questions": "1. How does Adam embody the ideals of the Mutqan initiative?\n2. How will you apply the thirty stories' values in your lifelong journey?"
    }
]

def seed_stories():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    count_added = 0
    # Add Arabic Stories
    for s in ARABIC_STORIES:
        cur.execute("""
        INSERT OR REPLACE INTO stories_library 
        (story_number, language, title, value_theme, content, questions, reading_time_min, pdf_page)
        VALUES (?, 'ar', ?, ?, ?, ?, 5, ?)
        """, (s["num"], s["title"], s["value"], s["content"], s["questions"], s["num"] * 2 - 1))
        count_added += 1

    # Add English Stories
    for s in ENGLISH_STORIES:
        cur.execute("""
        INSERT OR REPLACE INTO stories_library 
        (story_number, language, title, value_theme, content, questions, reading_time_min, pdf_page)
        VALUES (?, 'en', ?, ?, ?, ?, 5, ?)
        """, (s["num"], s["title"], s["value"], s["content"], s["questions"], s["num"]))
        count_added += 1

    conn.commit()
    conn.close()
    print(f"Successfully seeded {count_added} official stories into stories_library.")

if __name__ == "__main__":
    seed_stories()
