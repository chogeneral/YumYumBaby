// 아기의 월령에 따른 이유식 단계 정보와 인터넷상의 인기 레시피를 구조화하여 정의한 데이터 모듈입니다.
// 이 데이터를 활용하여 UI에서 아기 생일에 따른 맞춤 정보를 렌더링하고, 상세 레시피 조회가 가능하게 합니다.

// 이유식 단계별 설명 및 가이드라인 데이터 정의
// 사용자 화면에서 단계별 탭을 보여주고, 각 단계의 권장 시기와 가이드라인을 깔끔하게 출력하기 위해 배열 형태로 선언했습니다.
export const babyFoodStages = [
  {
    id: "early",
    title: "초기 이유식",
    period: "생후 4 ~ 6개월",
    description: "모유나 분유 외에 처음으로 고형식을 접하는 연습 단계입니다. 알레르기 반응을 확인하며 미음 형태로 시작합니다.",
    dailyCount: "하루 1회 (오전 권장)",
    texture: "물이 흐르는 듯 묽은 미음 형태 (10배죽)",
    keyIngredients: "쌀, 찹쌀, 애호박, 브로콜리, 감자, 완두콩 등",
    guidelines: [
      "처음에는 쌀미음으로 시작하여 3~4일 간격으로 새로운 채소를 하나씩 추가합니다.",
      "알레르기 반응(피부 발진, 설사 등)을 꼼꼼히 관찰해야 하므로 주로 오전에 수유 전에 먹입니다.",
      "이유식을 먹인 후에는 모유나 분유로 바로 충분히 수유하여 수유량을 채워줍니다.",
      "간을 전혀 하지 않는 맹물 맛의 묽은 미음이어야 아기의 미각에 무리가 가지 않습니다."
    ]
  },
  {
    id: "middle",
    title: "중기 이유식",
    period: "생후 7 ~ 9개월",
    description: "잇몸으로 음식을 으깨어 먹는 연습을 시작하는 단계입니다. 소고기, 닭고기 등 본격적인 육류 섭취로 철분을 보충해야 합니다.",
    dailyCount: "하루 2회 (오전/오후)",
    texture: "두부 정도의 굳기로 미세한 알갱이가 있는 죽 형태 (6~8배죽)",
    keyIngredients: "소고기, 닭고기, 대구살, 당근, 시금치, 양배추, 바나나 등",
    guidelines: [
      "아기의 뇌 발달과 빈혈 예방을 위해 매일 소고기나 닭고기 등 육류를 섭취할 수 있게 해줍니다.",
      "이때부터는 물 대신 채소 육수나 고기 육수를 사용하여 감칠맛을 내어 아기의 식욕을 돋웁니다.",
      "두부 정도의 단단함을 가진 부드러운 알갱이를 혀로 으깨어 삼키는 연습을 시킵니다.",
      "하루 수유량은 약 700~800ml 정도를 유지하며 이유식 횟수를 늘립니다."
    ]
  },
  {
    id: "late",
    title: "후기 & 완료기 이유식",
    period: "생후 10개월 이상",
    description: "다양한 질감을 경험하며 잇몸과 이빨로 씹는 연습을 하는 단계입니다. 유아식(세끼 식사)으로 넘어가기 전 최종 준비 기간입니다.",
    dailyCount: "하루 3회 (가족 식사 시간과 동기화)",
    texture: "으깬 바나나 정도의 단단함을 가진 무른 밥이나 진밥 형태 (2~4배죽)",
    keyIngredients: "소고기, 닭고기, 흰살생선, 계란 노른자, 두부, 표고버섯, 무, 각종 야채",
    guidelines: [
      "성인의 삼식 패턴에 맞춰 아침, 점심, 저녁 하루 세 번 이유식을 규칙적으로 먹입니다.",
      "철분과 단백질 섭취가 매우 중요한 시기이므로 매 끼니 고기나 생선, 계란, 두부 중 하나를 꼭 포함시킵니다.",
      "이제는 핑거 푸드(손으로 집어먹는 음식)를 제공하여 스스로 먹는 재미와 소근육 발달을 돕습니다.",
      "돌 이전까지는 벌꿀과 같이 영아 보툴리누스증을 유발할 수 있는 식재료는 절대 피합니다."
    ]
  }
];

// 인터넷 및 이유식 전문 서적에서 엄선한 단계별 인기 이유식 레시피 목록 정의
// 각 레시피마다 상세한 재료(ingredients), 요약 설명(description), 단계별 조리 과정(instructions), 꿀팁(tips)을 포함하여 정보의 완성도를 높였습니다.
export const babyFoodRecipes = [
  // --- 초기 이유식 레시피 (early) ---
  {
    id: "recipeEarly01",
    stage: "early",
    name: "첫걸음 쌀미음",
    description: "이유식의 가장 첫 단계로, 소화가 잘 되고 알레르기 유발 가능성이 가장 적은 기본 쌀가루 미음입니다.",
    ingredients: "쌀가루 10g, 찬물 200ml (20배 희석 비율)",
    instructions: [
      "냄비에 찬물 200ml를 붓고 쌀가루 10g을 완전히 풀어줍니다. 뜨거운 물에 쌀가루를 풀면 뭉칠 수 있으므로 반드시 찬물을 사용해야 합니다.",
      "가스레인지를 센 불로 켜고 쌀가루 물을 한 방향으로 저어가며 끓입니다.",
      "미음이 끓어오르기 시작하면 약불로 줄인 뒤, 냄비 바닥이 눌어붙지 않도록 스파출러나 주걱으로 약 5~7분간 계속 젓습니다.",
      "미음의 투명도가 증가하고 점성이 생기면(주르륵 흐르는 농도) 불을 끕니다.",
      "고운 체에 쌀미음을 한번 걸러내어 아기가 목넘김이 편하도록 덩어리 없는 부드러운 상태로 소분하여 보관합니다."
    ],
    tips: "이유식을 처음 시작하는 아기는 숟가락 감촉에 낯설어할 수 있습니다. 억지로 먹이기보다 하루 한두 숟가락으로 재미있게 연습하는 마음으로 다가가세요."
  },
  {
    id: "recipeEarly02",
    stage: "early",
    name: "애호박 미음",
    description: "달콤하고 부드러워 아기들에게 인기가 좋으며 소화 흡수가 잘 되는 대표적인 야채 미음입니다.",
    ingredients: "쌀가루 10g, 애호박 속살 10g, 찬물 200ml",
    instructions: [
      "애호박은 깨끗이 씻은 후 아기 소화에 부담을 줄 수 있는 껍질과 씨 부분을 칼로 제거하고 부드러운 속살만 10g 발라냅니다.",
      "냄비에 물을 끓여 껍질을 벗긴 애호박 속살을 넣고 속까지 투명하게 푹 삶아냅니다.",
      "삶은 애호박을 건져내어 믹서기에 찬물 약간과 함께 넣고 곱게 갈아주거나, 절구에 곱게 으깨어 체에 걸러줍니다.",
      "냄비에 찬물 200ml, 쌀가루 10g, 그리고 준비해 둔 애호박 페이스트를 넣고 덩어리가 풀릴 때까지 골고루 저어줍니다.",
      "센 불에서 끓이다 끓어오르면 약불로 줄여 5~6분간 저어가며 걸쭉하게 농도를 맞춘 뒤 체에 걸러 이유식 용기에 담아 완성합니다."
    ],
    tips: "애호박 껍질에는 섬유질이 많아 초기 아기 장에 무리가 갈 수 있으므로 반드시 껍질과 씨앗은 도려내고 초록색 속살 부분만 활용합니다."
  },
  {
    id: "recipeEarly03",
    stage: "early",
    name: "브로콜리 미음",
    description: "비타민 C와 칼슘이 풍부하여 면역력을 높여주며, 야채 특유의 향에 적응을 도와주는 영양 미음입니다.",
    ingredients: "쌀가루 10g, 브로콜리 꽃송이 부분 10g, 찬물 200ml",
    instructions: [
      "브로콜리는 단단한 기둥 줄기 부분은 잘라 버리고 영양이 가득하고 부드러운 꽃송이 윗부분만 칼로 도려내어 10g 준비합니다.",
      "식초를 떨어뜨린 물에 브로콜리 꽃송이를 5분간 담가두었다가 흐르는 물에 깨끗이 세척합니다.",
      "끓는 물에 베이킹소다 없이 브로콜리 꽃송이를 넣어 약 2~3분간 푹 삶은 다음 건져 찬물에 헹굽니다.",
      "믹서기에 삶은 브로콜리와 찬물을 약간 넣고 미세하게 갈아 입자를 최소화합니다.",
      "냄비에 쌀가루 10g, 찬물 200ml, 갈아둔 브로콜리를 모두 넣고 섞은 뒤 불에 올려 저어가며 5분간 뭉근히 끓여 체에 걸러 완성합니다."
    ],
    tips: "브로콜리 줄기는 매우 질기므로 초기에는 절대로 사용하지 마세요. 꽃 봉오리 부분만 잘 활용해도 풍부한 항산화 성분을 줄 수 있습니다."
  },
  {
    id: "recipeEarly04",
    stage: "early",
    name: "고소한 고구마 미음",
    description: "식이섬유가 풍부해 변비 예방에 탁월하며 자연스러운 단맛이 있어 편식하는 아기들도 매우 잘 먹는 미음입니다.",
    ingredients: "쌀가루 10g, 고구마 15g, 찬물 200ml",
    instructions: [
      "고구마는 흐르는 물에 흙을 씻어내고 껍질을 두껍게 깎아낸 뒤 얇게 썰어 준비합니다.",
      "찜기에 얇게 썬 고구마를 얹어 젓가락이 부드럽게 들어갈 때까지 약 10~15분간 푹 쪄내거나 끓는 물에 삶습니다.",
      "뜨거운 상태의 고구마를 체에 올려 숟가락 뒷면으로 꾹꾹 눌러 고운 고구마 앙금 상태로 걸러냅니다.",
      "냄비에 찬물 200ml와 쌀가루 10g을 풀어준 다음, 고운 고구마 앙금을 섞어 약한 불에서 가열합니다.",
      "눌어붙지 않도록 저어가며 보글보글 끓어오르면 3분 정도 뜸 들이듯 더 끓인 다음 한 김 식혀 용기에 담아냅니다."
    ],
    tips: "밤고구마보다는 부드럽고 수분감이 많은 호박고구마를 사용하면 체에 거르기가 한결 쉬우며 달콤한 맛도 배가 됩니다."
  },
  {
    id: "recipeEarly05",
    stage: "early",
    name: "달콤 단호박 미음",
    description: "베타카로틴이 풍부하고 자연적인 단맛이 있어 이유식 초기부터 아기들이 잘 받아들이는 인기 미음입니다.",
    ingredients: "쌀가루 10g, 단호박 속살 15g, 찬물 200ml",
    instructions: [
      "단호박은 반으로 갈라 씨를 제거한 뒤 껍질을 두껍게 깎아냅니다. 단호박 껍질은 단단하므로 안전에 주의하며 칼을 사용합니다.",
      "손질한 단호박 속살을 찜기에 얹고 젓가락이 쑥 들어갈 정도로 15~20분간 푹 쪄냅니다.",
      "쪄낸 단호박을 체에 올려 숟가락 뒷면으로 눌러가며 고운 체에 걸러 부드러운 페이스트로 만듭니다.",
      "냄비에 찬물 200ml와 쌀가루 10g을 풀어준 후 단호박 페이스트를 넣고 골고루 섞습니다.",
      "중불로 가열하며 한 방향으로 계속 저어주다가 끓어오르면 약불로 줄여 5분간 더 끓여 완성합니다."
    ],
    tips: "단호박을 찌기 전에 전자레인지에 2분 정도 돌리면 단단한 껍질을 벗기기가 훨씬 수월합니다. 껍질 부분에 영양이 많지만 초기에는 소화 부담이 있으므로 속살만 사용합니다."
  },
  {
    id: "recipeEarly06",
    stage: "early",
    name: "부드러운 감자 미음",
    description: "탄수화물 에너지원이자 소화가 매우 잘 되어 초기 이유식에 적합하며, 알레르기 유발 가능성이 극히 낮은 안전한 식재료입니다.",
    ingredients: "쌀가루 10g, 감자 15g, 찬물 200ml",
    instructions: [
      "감자는 껍질을 두껍게 깎아내어 싹이 난 부분을 완전히 제거합니다. 감자 싹에는 솔라닌이라는 독소가 있어 아기에게 위험할 수 있습니다.",
      "손질한 감자를 얇게 저며 끓는 물에 충분히 삶거나 찜기에 쪄서 완전히 익힙니다.",
      "익힌 감자를 뜨거울 때 체에 올려 눌러 가며 곱게 으깨어 덩어리가 없는 감자 앙금을 만듭니다.",
      "냄비에 찬물 200ml와 쌀가루 10g을 풀고 으깬 감자 15g을 넣어 고루 섞습니다.",
      "중불에서 가열하며 저어주다가 끓어오르면 약불로 줄여 5~6분 더 끓여 농도를 맞춘 뒤 체에 한 번 걸러 완성합니다."
    ],
    tips: "감자를 삶은 물도 영양이 있지만 초기 아기에게는 감자 자체의 전분 농도가 충분하므로 삶은 물은 버리고 찬물로 미음을 만드는 것이 적절한 농도 조절에 유리합니다."
  },
  {
    id: "recipeEarly07",
    stage: "early",
    name: "당근 미음",
    description: "베타카로틴과 비타민 A가 풍부해 눈 건강과 면역력 강화에 도움을 주는 대표적인 주황빛 야채 미음입니다.",
    ingredients: "쌀가루 10g, 당근 10g, 찬물 200ml",
    instructions: [
      "당근은 흐르는 물에 솔로 문질러 겉을 깨끗이 세척한 후 껍질을 칼로 얇게 깎아냅니다.",
      "껍질을 벗긴 당근을 얇게 썰어 끓는 물에 완전히 투명하게 무를 때까지 10분 이상 삶아냅니다.",
      "삶은 당근을 건져 믹서기에 넣고 찬물 약간과 함께 최대한 곱게 갈아냅니다. 당근은 섬유질이 있어 충분히 갈아야 합니다.",
      "간 당근을 고운 체에 한 번 걸러 입자를 최소화하여 고운 당근 퓨레를 준비합니다.",
      "냄비에 찬물 200ml와 쌀가루 10g, 당근 퓨레를 넣고 잘 섞은 뒤 중불로 저어가며 끓여 완성합니다."
    ],
    tips: "당근은 지용성 비타민인 베타카로틴을 함유하므로, 아기가 쌀미음에 충분히 적응한 후 당근 미음을 주면 영양 흡수에 도움이 됩니다. 처음엔 소량부터 시작해 알레르기 반응을 관찰합니다."
  },
  {
    id: "recipeEarly08",
    stage: "early",
    name: "사과 배 혼합 미음",
    description: "사과의 펙틴 성분과 배의 수분이 합쳐져 변비를 예방하고 소화를 돕는 과일 미음입니다. 자연스러운 단맛으로 아기가 잘 먹습니다.",
    ingredients: "쌀가루 10g, 사과 과육 10g, 배 과육 10g, 찬물 180ml",
    instructions: [
      "사과와 배는 각각 깨끗이 씻어 껍질과 씨를 완전히 제거합니다. 특히 씨방 주변의 딱딱한 부분도 도려냅니다.",
      "사과 과육을 작게 잘라 냄비에 물 약간과 함께 부드러워질 때까지 5~7분간 가열하여 익힙니다. 배는 열을 가하면 단맛이 줄 수 있어 생으로 갈아도 됩니다.",
      "익힌 사과와 생배를 믹서기에 넣어 최대한 곱게 갑니다.",
      "간 과일을 고운 체에 걸러 과육 찌꺼기를 제거한 뒤 맑은 과일 퓨레만 남깁니다.",
      "냄비에 찬물 180ml와 쌀가루 10g을 풀고 과일 퓨레를 넣어 약불에서 저어가며 5분간 가열하여 완성합니다."
    ],
    tips: "사과는 껍질 바로 아래에 영양이 많지만 초기에는 소화 부담이 있으므로 껍질째 갈지 않습니다. 과일 미음은 수유 후 간식 개념으로 소량 제공하고, 식사 대용으로 사용하지 않도록 합니다."
  },
  {
    id: "recipeEarly09",
    stage: "early",
    name: "완두콩 미음",
    description: "식물성 단백질과 식이섬유가 풍부한 완두콩은 초기 이유식에 사용 가능한 몇 안 되는 콩류로, 선명한 초록빛이 아기의 식욕을 돋웁니다.",
    ingredients: "쌀가루 10g, 완두콩 (냉동 또는 생것) 15g, 찬물 200ml",
    instructions: [
      "냉동 완두콩은 미지근한 물에 10분간 해동하고, 생 완두콩은 꼬투리에서 분리하여 준비합니다.",
      "끓는 물에 완두콩을 넣어 완전히 물러질 때까지 8~10분간 삶습니다. 완두콩 껍질이 벗겨지면 더욱 부드럽습니다.",
      "삶은 완두콩을 건져 믹서기에 찬물 약간과 함께 넣고 최대한 곱게 갑니다.",
      "간 완두콩을 고운 체에 여러 번 걸러 껍질 찌꺼기를 완전히 제거하고 부드러운 퓨레만 남깁니다.",
      "냄비에 찬물 200ml와 쌀가루 10g, 완두콩 퓨레를 넣고 중불에서 저어가며 끓여 완성합니다."
    ],
    tips: "완두콩은 알레르기 반응이 드물지만 처음 제공 시에는 소량부터 시작해 2~3일간 반응을 관찰합니다. 체에 걸러낸 완두콩 껍질은 버리고, 퓨레만 사용해야 아기가 소화하기 편합니다."
  },
  {
    id: "recipeEarly10",
    stage: "early",
    name: "시금치 미음",
    description: "철분과 엽산이 풍부한 시금치로 만든 진한 초록빛 미음입니다. 색이 강해 처음엔 거부할 수 있지만 다른 재료와 섞으면 잘 먹습니다.",
    ingredients: "쌀가루 10g, 시금치 잎 부분 10g, 찬물 200ml",
    instructions: [
      "시금치는 뿌리를 제거하고 잎 부분만 분리하여 흐르는 물에 여러 번 씻어 흙을 완전히 제거합니다.",
      "끓는 물에 시금치 잎을 넣고 1분 이내로 살짝 데칩니다. 오래 데치면 영양소가 손실됩니다.",
      "데친 시금치를 찬물에 헹궈 초록빛을 유지하고, 물기를 꼭 짜줍니다.",
      "시금치를 믹서기에 찬물 약간과 함께 넣고 최대한 곱게 간 후 고운 체에 걸러 섬유질을 제거합니다.",
      "냄비에 찬물 200ml와 쌀가루 10g, 시금치 퓨레를 넣고 중불에서 저어가며 5분간 끓여 완성합니다."
    ],
    tips: "시금치에는 옥살산이 있어 데쳐서 사용하는 것이 중요합니다. 또한 시금치와 철분이 많은 식품을 함께 먹이면 철분 흡수가 방해받을 수 있으므로, 수유 전에 제공하는 것이 좋습니다."
  },
  {
    id: "recipeEarly11",
    stage: "early",
    name: "바나나 미음",
    description: "에너지가 풍부하고 으깨기 쉬우며 자연스러운 단맛이 나는 바나나로 만든 간편 미음입니다. 별도의 조리 없이 빠르게 준비 가능합니다.",
    ingredients: "쌀가루 10g, 잘 익은 바나나 15g, 찬물 200ml",
    instructions: [
      "바나나는 껍질을 완전히 벗겨냅니다. 껍질에 검은 점이 생길 정도로 충분히 익은 바나나를 사용하면 더 달고 부드럽습니다.",
      "바나나 과육을 포크나 숟가락으로 으깨어 덩어리가 없는 부드러운 페이스트로 만듭니다.",
      "더 곱게 만들려면 믹서기에 바나나와 물 약간을 넣고 갈아줍니다.",
      "냄비에 찬물 200ml와 쌀가루 10g을 잘 풀어준 뒤 바나나 페이스트를 넣고 섞습니다.",
      "중불에서 저어가며 끓이다가 끓어오르면 약불로 줄여 3~4분 더 가열하여 완성합니다. 바나나 미음은 식으면 갈변할 수 있으므로 바로 제공합니다."
    ],
    tips: "바나나는 열을 가하면 단맛이 더 강해집니다. 그러나 바나나 미음은 식으면 빠르게 갈변하고 맛이 변하므로, 만든 즉시 아기에게 제공하고 남기지 않는 것이 원칙입니다."
  },
  {
    id: "recipeEarly12",
    stage: "early",
    name: "청경채 미음",
    description: "칼슘과 비타민 K가 풍부한 청경채는 뼈 성장에 도움을 주는 초록잎 채소로, 브로콜리 미음에 익숙해진 후 다음 단계로 시도하기 좋습니다.",
    ingredients: "쌀가루 10g, 청경채 잎 부분 10g, 찬물 200ml",
    instructions: [
      "청경채는 뿌리 부분을 잘라내고 잎과 줄기를 분리합니다. 초기에는 부드러운 잎 부분만 사용합니다.",
      "잎 부분을 흐르는 물에 여러 번 씻어 이물질을 제거합니다.",
      "끓는 물에 청경채 잎을 넣고 약 1~2분간 살짝 데칩니다.",
      "데친 청경채를 건져 찬물에 헹군 후 믹서기에 찬물 약간과 함께 넣어 곱게 갑니다.",
      "간 청경채를 고운 체에 걸러 섬유질을 제거한 뒤 냄비에 찬물 200ml, 쌀가루 10g과 함께 넣어 중불에서 저어가며 끓여 완성합니다."
    ],
    tips: "청경채는 특유의 향이 있어 처음에는 소량씩 혼합하여 제공하다가 점차 비율을 높입니다. 줄기 부분은 초기에 섬유질이 많아 소화에 부담이 될 수 있으므로 잎 부분만 사용합니다."
  },

  // --- 중기 이유식 레시피 (middle) ---
  {
    id: "recipeMiddle01",
    stage: "middle",
    name: "한우 소고기 브로콜리죽",
    description: "생후 6개월 이후 모유 수유아에게 결핍되기 쉬운 철분 보충을 위한 필수 영양 죽입니다.",
    ingredients: "불린 쌀 30g, 소고기 안심(또는 우둔살) 20g, 브로콜리 15g, 소고기 육수 240ml",
    instructions: [
      "소고기는 지방과 힘줄이 없는 안심 부위로 준비하고, 찬물에 10~15분 정도 담가 핏물을 살짝 뺀 후 끓는 물에 넣어 푹 삶아냅니다. (이때 나오는 거품은 숟가락으로 걷어내며 끓인 물은 버리지 말고 육수로 사용합니다.)",
      "삶은 소고기는 꺼내어 결 반대 방향으로 잘게 다진 후 믹서기에 육수를 약간 붓고 중간 크기(약 2~3mm) 입자로 갈아줍니다.",
      "브로콜리는 꽃부분만 손질해 데친 뒤 아기 잇몸으로 으깰 수 있도록 곱게 다져줍니다.",
      "불린 쌀은 절구에 가볍게 빻아 입자를 깨짐 형태로 만들어 냄비에 소고기, 브로콜리, 육수 240ml와 함께 담습니다.",
      "센 불로 가열하다가 죽이 끓기 시작하면 약불로 낮추고, 쌀알이 퍼져 퍼질 때까지 약 10~15분 동안 저으면서 익힙니다."
    ],
    tips: "소고기 핏물을 너무 오래 빼면 철분 성분이 다소 손실될 수 있으므로 15분 이내가 적당합니다. 남은 고기 삶은 물은 영양이 풍부한 훌륭한 베이스 육수가 됩니다."
  },
  {
    id: "recipeMiddle03",
    stage: "middle",
    name: "대구살 당근 애호박죽",
    description: "부드럽고 단백질이 풍부한 흰살생선 대구살을 이용해 담백하고 깔끔하게 끓여낸 중기죽입니다.",
    ingredients: "불린 쌀 30g, 다진 대구살 20g, 당근 10g, 애호박 15g, 야채 육수 240ml",
    instructions: [
      "초록마을 등에서 파는 아기용 다진 대구살을 준비하거나, 생물 대구살을 사와서 가시가 전혀 없는지 만져보며 꼼꼼히 확인하고 끓는 물에 데쳐냅니다.",
      "데친 대구살은 숟가락 등으로 가볍게 눌러 으깨어 줍니다.",
      "당근과 애호박은 껍질을 가볍게 다듬어 사방 2mm 크기로 아주 잘게 다져놓습니다.",
      "냄비에 빻은 쌀과 대구살, 당근, 애호박, 그리고 깔끔한 야채 육수를 넣고 고루 섞어줍니다.",
      "센 불에 한소끔 끓인 뒤, 약불로 12분가량 쌀알이 푹 퍼지고 채소들의 숨이 죽어 아기가 삼키기 편한 촉촉한 농도가 될 때까지 조리합니다."
    ],
    tips: "대구 등 흰살생선은 지방 함량이 적고 단백질이 많아 이유식에 안성맞춤입니다. 혹시 모를 잔가시가 있을 수 있으니 조리 전 손가락 끝으로 고기를 매만지며 한 번 더 체크해주세요."
  },
  {
    id: "recipeMiddle04",
    stage: "middle",
    name: "시금치 소고기죽",
    description: "철분이 풍부한 소고기와 엽산이 가득한 시금치를 함께 넣어 중기 아기의 빈혈 예방과 성장 발달을 동시에 챙기는 영양죽입니다.",
    ingredients: "불린 쌀 30g, 소고기 다짐육 20g, 시금치 잎 15g, 소고기 육수 240ml",
    instructions: [
      "소고기 다짐육은 찬물에 10분간 담가 핏물을 가볍게 제거한 뒤 건져 물기를 뺍니다.",
      "시금치는 잎 부분만 골라 끓는 물에 1분간 살짝 데쳐 찬물에 헹군 뒤, 물기를 꼭 짜내고 잘게 다집니다.",
      "달군 냄비에 물을 약간 두르고 소고기 다짐육을 넣어 회색빛이 될 때까지 볶아 익힙니다.",
      "익은 소고기에 불린 쌀과 소고기 육수 240ml를 붓고 센 불로 가열합니다.",
      "죽이 끓어오르면 약불로 줄이고 다진 시금치를 넣어 함께 10~12분 더 끓여 쌀알이 충분히 퍼지면 완성합니다."
    ],
    tips: "시금치를 넣기 전 충분히 볶아 소고기의 잡내를 제거해야 아기가 잘 먹습니다. 시금치는 너무 오래 끓이면 색이 검게 변하므로 마지막 5분 안에 넣는 것이 색감 유지에 좋습니다."
  },
  {
    id: "recipeMiddle05",
    stage: "middle",
    name: "닭고기 감자죽",
    description: "소화가 부드러운 닭가슴살과 탄수화물이 풍부한 감자를 함께 끓여 에너지 보충에 탁월하고, 아이가 거부감 없이 잘 먹는 맛있는 중기죽입니다.",
    ingredients: "불린 쌀 30g, 닭가슴살 20g, 감자 20g, 채수 또는 닭 육수 240ml",
    instructions: [
      "닭가슴살은 우유나 분유에 10분 담가 잡내를 제거한 뒤 헹궈 끓는 물에 완전히 삶습니다.",
      "삶은 닭가슴살은 결을 따라 찢어 2~3mm 크기로 잘게 다집니다.",
      "감자는 껍질을 벗기고 씨 눈 부분을 제거한 뒤 작은 주사위 모양으로 썰어 물에 5분간 담가 전분기를 뺍니다.",
      "냄비에 불린 쌀, 다진 닭고기, 썰어둔 감자와 육수 240ml를 모두 넣고 센 불에 올립니다.",
      "끓기 시작하면 약불로 줄여 감자가 완전히 물러지고 쌀알이 퍼질 때까지 12~15분간 저어가며 끓여 완성합니다."
    ],
    tips: "감자에 전분이 많아 일반 죽보다 빠르게 바닥이 눌어붙을 수 있습니다. 물의 양을 약간 넉넉하게 잡고, 죽 끓이는 동안 바닥을 자주 저어주는 것이 중요합니다."
  },
  {
    id: "recipeMiddle07",
    stage: "middle",
    name: "달걀 애호박 당근죽",
    description: "달걀 노른자의 고소한 풍미와 애호박, 당근의 달콤한 채소 맛이 어우러진 중기 이유식입니다. 단백질과 베타카로틴을 함께 섭취할 수 있는 영양 균형 죽입니다.",
    ingredients: "불린 쌀 30g, 달걀 노른자 1개, 애호박 15g, 당근 10g, 야채 육수 240ml",
    instructions: [
      "애호박은 껍질을 얇게 벗기고 씨 부분을 제거한 뒤 2mm 크기로 곱게 다지고, 당근도 껍질을 벗겨 같은 크기로 잘게 다집니다.",
      "냄비에 불린 쌀과 야채 육수 240ml를 넣고 센 불에 올려 끓어오르면 중약불로 줄입니다.",
      "쌀이 반쯤 퍼지면 다진 당근을 먼저 넣어 3분간 끓인 뒤, 애호박을 추가하여 5분 더 끓입니다.",
      "죽이 걸쭉하게 완성 단계에 이르면 달걀을 흰자와 노른자로 분리하여 노른자만 죽에 넣습니다.",
      "약불에서 노른자를 골고루 섞어가며 1~2분간 완전히 익혀 노란빛이 고루 배면 불을 끄고 완성합니다."
    ],
    tips: "달걀 노른자는 생후 7개월 이후 중기부터 시도를 권장합니다. 돌 이전에는 흰자는 알레르기 위험이 있으므로 반드시 노른자만 사용하세요. 처음 시도할 때는 노른자 1/4개 분량으로 시작해 2~3일간 아기의 피부 및 대변 상태를 관찰합니다."
  },
  {
    id: "recipeMiddle08",
    stage: "middle",
    name: "닭고기 아보카도 고구마죽",
    description: "담백한 닭고기와 크리미한 아보카도, 달콤한 고구마가 어우러진 영양 만점 중기 이유식입니다. 아보카도의 건강한 지방이 뇌 발달을 돕습니다.",
    ingredients: "불린 쌀 30g, 닭가슴살 20g, 아보카도 20g, 고구마 15g, 닭 육수 또는 채수 200ml",
    instructions: [
      "닭가슴살은 찬물에 씻어 끓는 물에 완전히 삶은 뒤 잘 식혀 2mm 크기로 곱게 다집니다.",
      "고구마는 껍질을 벗기고 찜기에 쪄서 완전히 익힌 뒤 숟가락으로 곱게 으깨어 고구마 매시를 만듭니다.",
      "아보카도는 잘 익은 것으로 골라 씨와 껍질을 제거하고 숟가락으로 부드럽게 으깹니다. 아보카도는 가열하지 않고 마지막에 넣습니다.",
      "냄비에 불린 쌀, 다진 닭고기, 고구마 매시, 육수를 모두 넣고 센 불에 끓이다가 끓어오르면 약불로 줄여 10분간 저어가며 조리합니다.",
      "불을 끄고 으깬 아보카도를 넣어 죽과 골고루 섞어 완성합니다. 아보카도는 열을 가하면 쓴맛이 날 수 있어 반드시 불 끈 후 넣습니다."
    ],
    tips: "아보카도는 산화가 빠르므로 조리 직전에 손질하고, 남은 아보카도는 씨를 붙인 채 랩으로 감싸 냉장 보관합니다. 처음 시도 시 아보카도 1~2 티스푼부터 시작해 알레르기 반응을 확인하세요."
  },
  {
    id: "recipeMiddle09",
    stage: "middle",
    name: "두부 시금치죽",
    description: "고소한 두부의 식물성 단백질과 철분이 풍부한 시금치가 만나 아기의 성장과 빈혈 예방을 동시에 돕는 중기 이유식입니다.",
    ingredients: "불린 쌀 30g, 두부 30g, 시금치 잎 15g, 야채 육수 240ml",
    instructions: [
      "시금치는 잎 부분만 골라 끓는 물에 30초간 데친 뒤 찬물에 헹궈 물기를 꼭 짜고 2mm 크기로 잘게 다집니다.",
      "두부는 끓는 물에 1~2분 데쳐 잡내와 간수를 제거한 뒤 면포나 키친타월로 수분을 눌러 빼고 곱게 으깹니다.",
      "냄비에 불린 쌀과 야채 육수 240ml를 넣고 센 불에 올려 끓어오르면 약불로 줄입니다.",
      "쌀이 반쯤 퍼지면 으깬 두부와 다진 시금치를 넣고 주걱으로 골고루 섞어줍니다.",
      "약불에서 10~12분간 바닥이 눌어붙지 않게 저어가며 쌀알이 완전히 퍼지면 완성합니다."
    ],
    tips: "시금치는 과하게 데치면 철분과 엽산이 손실되므로 30초 이내로 짧게 데치는 것이 좋습니다. 두부는 데친 후 수분을 충분히 제거해야 죽 농도가 묽어지지 않습니다."
  },
  {
    id: "recipeMiddle10",
    stage: "middle",
    name: "새우브로콜리죽",
    description: "풍부한 단백질과 아연이 함유된 새우살로 아기의 성장과 면역력을 동시에 챙기는 중기 이유식입니다.",
    ingredients: "불린 쌀 30g, 새우살 (냉동 무첨가) 20g, 브로콜리 꽃송이 15g, 야채 육수 240ml",
    instructions: [
      "냉동 새우살은 냉장실에서 해동하거나 흐르는 찬물에 해동합니다. 첨가물이 없는 순수 새우살을 선택합니다.",
      "해동된 새우살을 끓는 물에 데쳐 익힌 뒤 잘게 다집니다. 새우 특유의 냄새가 신경 쓰이면 데칠 때 생강 한 조각을 넣습니다.",
      "브로콜리는 꽃송이 부분만 손질하여 끓는 물에 2분간 데친 뒤 2~3mm 크기로 곱게 다집니다.",
      "냄비에 불린 쌀과 야채 육수 240ml를 넣어 끓이다가, 끓으면 약불로 줄입니다.",
      "다진 새우살과 브로콜리를 넣어 10~12분 더 끓여 죽이 충분히 퍼지면 완성합니다."
    ],
    tips: "새우는 알레르기를 유발할 수 있는 식품 중 하나입니다. 반드시 처음에는 소량(1/4 분량)으로 시작하여 2~3일간 피부 발진, 설사, 구토 등의 반응을 면밀히 관찰합니다. 가족 중 갑각류 알레르기가 있다면 의사와 상의 후 제공합니다."
  },
  {
    id: "recipeMiddle12",
    stage: "middle",
    name: "찹쌀 닭죽",
    description: "찹쌀 특유의 찰지고 부드러운 식감이 닭고기의 담백함과 잘 어우러지는 중기 이유식입니다. 일반 쌀죽보다 더 부드럽고 소화가 잘 되어 아기 속을 편안하게 해줍니다.",
    ingredients: "불린 찹쌀 25g, 불린 백미 10g, 닭가슴살 20g, 애호박 10g, 닭 육수 또는 채수 250ml",
    instructions: [
      "닭가슴살은 찬물에 씻어 끓는 물에 완전히 삶은 뒤 식혀서 결대로 찢은 다음 칼로 2mm 크기로 곱게 다집니다.",
      "애호박은 껍질을 벗기고 씨를 제거한 뒤 2mm 크기로 잘게 다집니다.",
      "불린 찹쌀과 백미를 함께 믹서기에 넣고 육수 약간을 더해 굵게 갈아 쌀 입자를 반 정도로 줄입니다.",
      "냄비에 갈아낸 쌀, 다진 닭고기, 다진 애호박, 육수 250ml를 모두 넣고 센 불에 올려 끓입니다.",
      "끓어오르면 약불로 줄이고 찹쌀이 완전히 퍼져 걸쭉해질 때까지 12~15분간 바닥을 긁듯이 저어가며 조리합니다."
    ],
    tips: "찹쌀은 일반 쌀보다 전분 함량이 높아 냄비 바닥에 쉽게 눌어붙습니다. 약불에서 쉬지 않고 저어주는 것이 중요합니다. 찹쌀과 백미를 7:3 비율로 섞으면 너무 찰지지 않고 적당한 농도로 완성됩니다."
  },

  // --- 후기 & 완료기 이유식 레시피 (late) ---
  {
    id: "recipeLate01",
    stage: "late",
    name: "쇠고기 버섯 볶은 무른밥",
    description: "쇠고기와 표고버섯을 먼저 참기름에 볶아 고소한 감칠맛을 더한 뒤 무른밥에 섞어 만드는 후기 이유식입니다. 씹는 연습을 도우면서도 촉촉하게 먹기 좋습니다.",
    ingredients: "무른밥 80g (쌀 40g 기준), 쇠고기 다짐육 30g, 표고버섯 20g, 애호박 15g, 당근 10g, 참기름 1~2방울, 소고기 육수 100ml",
    instructions: [
      "쇠고기 다짐육은 키친타월로 핏물을 제거하고, 표고버섯은 기둥을 제거한 갓 부분만 3~4mm 크기로 잘게 다집니다.",
      "애호박과 당근도 껍질을 벗겨 3~4mm 크기로 잘게 다집니다.",
      "달군 냄비에 참기름 1~2방울을 두르고 쇠고기를 먼저 넣어 색이 변할 때까지 볶은 뒤 다진 표고버섯, 당근, 애호박을 차례로 넣어 함께 볶습니다.",
      "재료가 고루 익으면 미리 지어둔 무른밥을 넣고 육수 100ml를 부어 잘 섞어줍니다.",
      "중약불에서 밥알이 뭉근하게 퍼지고 국물이 자작하게 졸아들 때까지 5~7분간 저어가며 조리하면 완성합니다."
    ],
    tips: "참기름은 돌 이전 아기에게도 소량 사용 가능하며, 볶음 향을 더해 아기의 식욕을 돋웁니다. 표고버섯 향이 강하면 끓는 물에 살짝 데친 후 찬물에 헹궈 사용하면 향이 부드러워집니다."
  },
  {
    id: "recipeLate02",
    stage: "late",
    name: "소고기 주먹밥",
    description: "고소하게 볶은 소고기를 무른밥에 섞어 동글동글 뭉친 후기 이유식 주먹밥입니다. 아기 스스로 집어 먹으며 자기주도 식사 습관을 기르기 좋습니다.",
    ingredients: "무른밥 90g, 소고기 다짐육 25g, 당근 10g, 시금치 잎 10g, 참기름 1~2방울",
    instructions: [
      "당근은 껍질을 벗기고 최대한 곱게 다지고, 시금치는 잎 부분만 끓는 물에 30초 데쳐 찬물에 헹군 뒤 물기를 짜고 잘게 다집니다.",
      "소고기 다짐육은 키친타월로 핏물을 제거한 뒤 팬에 물 1큰술을 두르고 색이 완전히 변할 때까지 볶아 익힙니다.",
      "소고기가 익으면 다진 당근과 시금치를 넣고 물이 거의 없어질 때까지 함께 볶아줍니다.",
      "볼에 따뜻한 무른밥을 담고 볶은 소고기와 채소, 참기름 1~2방울을 넣어 주걱으로 고루 섞습니다.",
      "손을 물에 살짝 적신 뒤 한 입 크기(지름 약 3cm)로 동글동글하게 가볍게 뭉쳐 아기 식판에 담아 완성합니다."
    ],
    tips: "주먹밥은 너무 단단하게 뭉치면 아기 목에 걸릴 수 있으므로 가볍게 쥐어 잇몸으로 쉽게 으깨지는 부드러운 강도로 만들어 주세요. 한 번에 먹을 양만 뭉치고 남은 밥은 냉장 보관합니다."
  },
  {
    id: "recipeLate03",
    stage: "late",
    name: "두부 우유찜",
    description: "부드러운 두부와 고소한 우유를 함께 쪄낸 달걀 없는 후기 이유식 반찬입니다. 달걀 알레르기가 있는 아기에게도 안심하고 줄 수 있는 단백질 요리입니다.",
    ingredients: "두부 60g, 아기용 우유(또는 분유물) 50ml, 애호박 10g, 당근 5g",
    instructions: [
      "두부는 끓는 물에 1~2분 데쳐 잡내와 간수를 제거한 뒤 면포로 수분을 꼭 짜고 숟가락으로 최대한 곱게 으깹니다.",
      "애호박과 당근은 껍질을 벗기고 최대한 곱게 다진 뒤 각각 끓는 물에 1분씩 데쳐 익혀줍니다.",
      "내열 용기에 으깬 두부와 우유 50ml를 넣고 포크나 거품기로 부드럽게 섞어 두부가 우유에 고루 풀어지도록 합니다.",
      "데친 애호박과 당근을 두부 우유 혼합물에 넣고 고루 섞은 뒤 그릇에 평평하게 담습니다.",
      "냄비에 물을 채우고 찜기에 그릇을 올려 뚜껑을 덮고 중약불에서 10~12분간 찌면 완성입니다."
    ],
    tips: "우유 대신 아기가 먹는 분유를 물에 타서 사용해도 됩니다. 찜 후 식히면 더욱 탱글하게 굳어 숟가락으로 떠먹이기 좋습니다. 냉장 보관 시 당일 안에 먹이는 것을 권장합니다."
  },
  {
    id: "recipeLate04",
    stage: "late",
    name: "연어 표고버섯 무른밥",
    description: "DHA가 풍부한 연어와 면역력을 높여주는 표고버섯을 함께 볶아 무른밥에 섞은 영양 가득한 후기 이유식입니다. 고소하고 감칠맛 나는 한 끼입니다.",
    ingredients: "무른밥 90g, 연어살 30g, 표고버섯 20g, 애호박 15g, 참기름 1~2방울, 야채 육수 80ml",
    instructions: [
      "연어는 껍질과 가시를 완전히 제거한 뒤 끓는 물에 2~3분 데쳐 익히고, 식으면 포크로 잘게 으깨어 풀어줍니다.",
      "표고버섯은 기둥을 제거하고 끓는 물에 1분 데쳐 향을 순하게 한 뒤 3~4mm 크기로 잘게 다집니다.",
      "애호박은 껍질을 벗겨 3~4mm 크기로 잘게 다집니다.",
      "냄비에 참기름 1~2방울을 두르고 다진 표고버섯과 애호박을 먼저 볶다가 으깬 연어를 넣어 함께 살짝 볶아줍니다.",
      "무른밥과 육수 80ml를 넣고 골고루 섞어 중약불에서 5~7분간 국물이 자작해질 때까지 저어가며 조리하면 완성입니다."
    ],
    tips: "연어는 오메가-3 함량이 높아 자주 먹이면 좋지만 주 2~3회 정도가 적당합니다. 표고버섯은 데치면 향이 부드러워져 아기가 거부감 없이 먹을 수 있습니다. 냉동 연어 사용 시 완전히 해동 후 신선도를 확인하세요."
  },
  {
    id: "recipeLate05",
    stage: "late",
    name: "닭가슴살 시금치 무른밥",
    description: "담백한 닭가슴살과 철분이 풍부한 시금치를 함께 볶아 무른밥에 섞은 후기 이유식입니다. 단백질과 철분을 균형 있게 섭취할 수 있는 든든한 한 끼입니다.",
    ingredients: "무른밥 90g, 닭가슴살 25g, 시금치 잎 20g, 당근 10g, 참기름 1~2방울, 닭 육수 60ml",
    instructions: [
      "닭가슴살은 찬물에 씻어 끓는 물에 완전히 삶은 뒤 식혀 3~4mm 크기로 곱게 다집니다.",
      "시금치는 잎 부분만 골라 끓는 물에 30초간 데친 뒤 찬물에 헹궈 물기를 꼭 짜고 잘게 다집니다.",
      "당근은 껍질을 벗겨 3~4mm 크기로 곱게 다집니다.",
      "냄비에 참기름 1~2방울을 두르고 다진 당근을 먼저 2분간 볶다가 닭고기와 시금치를 넣어 함께 볶아줍니다.",
      "무른밥과 육수 60ml를 넣고 골고루 섞어 중약불에서 5~7분간 국물이 자작해질 때까지 저어가며 조리하면 완성입니다."
    ],
    tips: "시금치의 철분은 닭고기의 동물성 단백질과 함께 먹으면 흡수율이 높아집니다. 시금치를 너무 오래 데치면 철분과 엽산이 손실되므로 30초 이내로 짧게 데치세요."
  },
  {
    id: "recipeLate06",
    stage: "late",
    name: "배추 시금치 달걀죽",
    description: "소화가 잘 되는 배추와 철분이 풍부한 시금치, 고소한 달걀이 어우러진 후기 이유식 죽입니다. 부드럽고 담백해 아픈 날이나 소화가 필요한 날에 특히 좋습니다.",
    ingredients: "무른밥 80g, 달걀 1개, 배추 잎 20g, 시금치 잎 15g, 야채 육수 100ml",
    instructions: [
      "배추는 부드러운 잎 부분만 골라 끓는 물에 1분간 데친 뒤 찬물에 헹궈 물기를 짜고 3~4mm 크기로 잘게 다집니다.",
      "시금치는 잎 부분만 끓는 물에 30초간 데쳐 찬물에 헹군 뒤 물기를 꼭 짜고 잘게 다집니다.",
      "달걀은 볼에 풀어 알끈을 제거하고 고루 섞어 달걀물을 만들어 둡니다.",
      "냄비에 무른밥, 다진 배추, 다진 시금치, 육수 100ml를 넣고 중불에 올려 끓이다가 끓어오르면 약불로 줄입니다.",
      "약불에서 5분간 저어가며 끓인 뒤 달걀물을 가늘게 천천히 부어 골고루 섞으면서 1~2분 더 익혀 완성합니다."
    ],
    tips: "달걀물은 한꺼번에 붓지 않고 가늘게 천천히 부어가며 섞어야 죽에 고루 퍼져 부드럽게 완성됩니다. 배추는 심 부분보다 잎 부분이 훨씬 부드러우므로 잎만 사용하세요."
  },
  {
    id: "recipeLate07",
    stage: "late",
    name: "두부 미역 양파 무른밥",
    description: "칼슘이 풍부한 미역과 식물성 단백질 두부, 자연 단맛을 내는 양파를 함께 볶아 무른밥에 섞은 후기 이유식입니다. 미역의 미끈한 식감이 소화를 돕습니다.",
    ingredients: "무른밥 90g, 두부 40g, 건미역 3g (불린 후 30g), 양파 15g, 참기름 1~2방울, 야채 육수 80ml",
    instructions: [
      "건미역은 찬물에 20~30분 충분히 불린 뒤 끓는 물에 1분간 데쳐 쓴맛을 없애고 물기를 짜서 3~4mm 크기로 잘게 다집니다.",
      "두부는 끓는 물에 1~2분 데쳐 잡내를 제거한 뒤 면포로 수분을 꼭 짜고 숟가락으로 곱게 으깹니다.",
      "양파는 껍질을 벗기고 3~4mm 크기로 잘게 다집니다.",
      "냄비에 참기름 1~2방울을 두르고 다진 양파를 먼저 1~2분 볶아 단맛을 낸 뒤 다진 미역과 으깬 두부를 넣어 함께 볶아줍니다.",
      "무른밥과 육수 80ml를 넣고 골고루 섞어 중약불에서 5~7분간 국물이 자작해질 때까지 저어가며 조리하면 완성입니다."
    ],
    tips: "미역은 요오드가 풍부해 아기 갑상선 발달에 도움이 됩니다. 단, 매일 먹이기보다 주 2~3회가 적당합니다. 건미역은 불리면 양이 10배 정도 늘어나므로 처음에 소량만 사용하세요."
  },
  {
    id: "recipeLate08",
    stage: "late",
    name: "소고기 미역국",
    description: "칼슘과 요오드가 풍부한 미역에 철분이 가득한 소고기를 넣어 끓인 후기 이유식 국입니다. 무른밥에 말아 주면 균형 잡힌 한 끼 식사가 됩니다.",
    ingredients: "건미역 3g (불린 후 30g), 소고기 안심 또는 우둔살 30g, 참기름 2방울, 물 300ml",
    instructions: [
      "건미역은 찬물에 20~30분 충분히 불린 뒤 끓는 물에 1분 데쳐 불순물을 제거하고 물기를 짜서 1~2cm 길이로 잘게 자릅니다.",
      "소고기는 키친타월로 핏물을 제거하고 결 반대 방향으로 3~4mm 크기로 잘게 다집니다.",
      "냄비에 참기름 2방울을 두르고 다진 소고기를 넣어 중약불에서 색이 변할 때까지 볶습니다.",
      "소고기가 익으면 잘라 둔 미역을 넣고 함께 1~2분 더 볶아 미역에 기름기가 고루 배도록 합니다.",
      "물 300ml를 부어 센 불에 끓이다가 끓어오르면 약불로 줄여 뚜껑을 반쯤 열고 15~20분간 미역이 완전히 부드러워질 때까지 끓여 완성합니다."
    ],
    tips: "미역을 볶은 후 끓이면 국물이 더 진하고 고소해집니다. 간은 전혀 하지 않고 소고기와 미역 자체의 감칠맛으로 맛을 냅니다. 미역은 주 2~3회가 적당하며, 과잉 섭취 시 요오드 과다로 갑상선 기능에 영향을 줄 수 있습니다."
  },
  {
    id: "recipeLate09",
    stage: "late",
    name: "대구살 완두콩 양배추 무른밥",
    description: "지방이 적고 소화가 잘 되는 흰살생선 대구살에 달콤한 완두콩과 위장을 부드럽게 해주는 양배추를 더한 후기 이유식입니다. 담백하고 부드러운 맛이 특징입니다.",
    ingredients: "무른밥 90g, 대구살 30g, 냉동 완두콩 20g, 양배추 잎 20g, 야채 육수 90ml",
    instructions: [
      "대구살은 가시가 없는지 손으로 꼼꼼히 확인하고 끓는 물에 2~3분 데쳐 익힌 뒤 숟가락으로 잘게 으깨어 풀어줍니다.",
      "냉동 완두콩은 끓는 물에 5분간 삶아 충분히 부드럽게 익힌 뒤 건져 숟가락으로 가볍게 으깨줍니다.",
      "양배추는 부드러운 잎 부분만 골라 끓는 물에 1분 데친 뒤 찬물에 헹궈 물기를 짜고 3~4mm 크기로 잘게 다집니다.",
      "냄비에 무른밥, 으깬 대구살, 완두콩, 다진 양배추, 육수 90ml를 모두 넣고 골고루 섞어 중불에 올립니다.",
      "끓어오르면 약불로 줄여 5~7분간 국물이 자작해질 때까지 저어가며 조리하면 완성입니다."
    ],
    tips: "대구 등 흰살생선은 가시가 숨어 있을 수 있으므로 조리 전 반드시 손가락으로 살을 만져가며 가시를 제거하세요. 완두콩은 후기에도 반드시 충분히 익혀 아기가 쉽게 으깰 수 있도록 해야 합니다."
  },
  {
    id: "recipeLate10",
    stage: "late",
    name: "닭고기 고구마 사과 무른밥",
    description: "담백한 닭고기에 달콤한 고구마와 새콤달콤한 사과를 더해 아기의 입맛을 사로잡는 후기 이유식입니다. 식이섬유가 풍부해 변비 예방에도 도움이 됩니다.",
    ingredients: "무른밥 90g, 닭가슴살 25g, 고구마 25g, 사과 20g, 닭 육수 80ml",
    instructions: [
      "닭가슴살은 끓는 물에 완전히 삶은 뒤 식혀서 3~4mm 크기로 곱게 다집니다.",
      "고구마는 껍질을 벗기고 찜기에 쪄서 완전히 익힌 뒤 숟가락으로 곱게 으깨어 매시를 만듭니다.",
      "사과는 껍질과 씨를 제거하고 강판에 갈거나 3mm 크기로 잘게 다집니다.",
      "냄비에 무른밥, 다진 닭고기, 고구마 매시, 육수 80ml를 넣고 골고루 섞어 중불에 올려 끓입니다.",
      "끓어오르면 약불로 줄여 5분간 저어가며 조리한 뒤 불을 끄고 다진 사과를 넣어 섞어 완성합니다."
    ],
    tips: "사과는 가열하면 단맛이 강해지고 식감이 물러지지만, 마지막에 생으로 넣으면 상큼한 향과 아삭한 식감을 살릴 수 있습니다. 고구마의 단맛이 강하므로 처음에는 양을 줄여 다른 이유식과 번갈아 제공하는 것이 좋습니다."
  },
  {
    id: "recipeLate11",
    stage: "late",
    name: "아기 시금치 달걀죽",
    description: "철분이 풍부한 시금치와 단백질 덩어리 계란을 함께 넣어 후기 아기의 성장 발달을 한 그릇에 채워주는 영양죽입니다.",
    ingredients: "진밥 80g, 계란 1개 (완료기 전이면 노른자 2개로 대체), 시금치 잎 20g, 채소 육수 150ml",
    instructions: [
      "시금치는 잎 부분만 골라 끓는 물에 1분간 살짝 데쳐 찬물에 헹군 뒤 물기를 꼭 짜고 3~5mm 크기로 잘게 다집니다.",
      "계란은 완료기(12개월 전후)라면 전란을 사용하고, 그 이전이라면 노른자만 분리합니다. 볼에 넣고 잘 풀어둡니다.",
      "냄비에 진밥과 채소 육수 150ml를 넣고 중불에 올려 끓이기 시작합니다.",
      "죽이 끓어오르면 약불로 낮추고 다진 시금치를 넣어 3~4분간 함께 끓입니다.",
      "불을 끄고 풀어둔 계란을 죽 위에 조금씩 부어가며 잔열로 저어 완전히 익혀 완성합니다."
    ],
    tips: "계란 흰자를 처음 시도할 때는 반드시 소량부터 주고 두드러기, 설사, 구토 등 알레르기 반응을 확인합니다. 시금치를 너무 오래 끓이면 철분이 손실되고 색이 검게 변하므로, 마지막 단계에 넣어 짧게 가열합니다."
  },
  {
    id: "recipeLate12",
    stage: "late",
    name: "연두부 사과 스크램블",
    description: "부드러운 연두부와 달콤한 사과, 계란 노른자를 활용한 후기 이유식 반찬입니다. 핑거푸드 형태로도 제공 가능하며 여러 식감을 동시에 경험할 수 있습니다.",
    ingredients: "연두부 50g, 사과 과육 20g, 계란 노른자 1개, 식용유 소량",
    instructions: [
      "연두부는 면포에 감싸 가볍게 눌러 수분을 빼고, 포크로 잘게 으깨어 준비합니다.",
      "사과는 껍질과 씨를 완전히 제거하고 3~5mm 크기로 잘게 다집니다.",
      "볼에 으깬 연두부, 다진 사과, 계란 노른자를 넣고 골고루 섞어줍니다.",
      "팬에 식용유를 키친타월로 얇게 펴 닦아 최소한만 남기고 중약불에 올립니다.",
      "혼합물을 팬에 붓고 주걱으로 계속 저어가며 계란이 완전히 익어 스크램블 형태가 될 때까지 조리한 뒤 식판에 담아 완성합니다."
    ],
    tips: "사과 과육에 수분이 많아 연두부와 섞으면 흐물흐물해질 수 있습니다. 사과를 다진 후 키친타월로 수분을 살짝 제거하면 모양이 잘 유지됩니다. 만든 즉시 제공해야 하며 사과 갈변 방지를 위해 바로 조리합니다."
  }
];

// 각 레시피의 대표 이미지, 유튜브 직접 링크, 조리 단계 사진(3장)을 관리합니다.
// stepImages: 재료+조리과정+완성 사진 3장 — 5단계에서 순환(idx % 3)으로 표시합니다.
export const recipeMedia = {
  recipeEarly01: {
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=RB2qtJLzWUA",
    stepImages: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly02: {
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=xH1iX5RuPaE",
    stepImages: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly03: {
    imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=HjzjIdaRjzY",
    stepImages: [
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly04: {
    imageUrl: "https://images.unsplash.com/photo-1508002366005-75a695ee5b47?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=57oBo1ELNvw",
    stepImages: [
      "https://images.unsplash.com/photo-1508002366005-75a695ee5b47?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly05: {
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=vV9xtJL7d10",
    stepImages: [
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly06: {
    imageUrl: "https://images.unsplash.com/photo-1518977676901-baab3a2c79de?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=Du8Cwxq4c0Q",
    stepImages: [
      "https://images.unsplash.com/photo-1518977676901-baab3a2c79de?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518977676901-baab3a2c79de?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly07: {
    imageUrl: "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=N-cvgu9DwGM",
    stepImages: [
      "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly08: {
    imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=ZGg4wlmu-YQ",
    stepImages: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly09: {
    imageUrl: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=6K23svfS2C0",
    stepImages: [
      "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly10: {
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=t92Pq-rS4zU",
    stepImages: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly11: {
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=1nR9sCQPNeU",
    stepImages: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeEarly12: {
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=pAJ2VPt9iro",
    stepImages: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeMiddle01: {
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=Q3L6sD67_BE",
    stepImages: [
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeMiddle03: {
    imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=6cIsEkRdp0g",
    stepImages: [
      "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeMiddle04: {
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=I-Oewy909ks",
    stepImages: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeMiddle05: {
    imageUrl: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=J1W7r0WBp2Y",
    stepImages: [
      "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518977676901-baab3a2c79de?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeMiddle07: {
    imageUrl: "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=aNg1Fj1Ncjw",
    stepImages: [
      "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeMiddle08: {
    imageUrl: "https://images.unsplash.com/photo-1508002366005-75a695ee5b47?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=z0_5UIv1VHU&t=5s",
    stepImages: [
      "https://images.unsplash.com/photo-1508002366005-75a695ee5b47?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeMiddle09: {
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=crODavEfup0",
    stepImages: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeMiddle10: {
    imageUrl: "https://images.unsplash.com/photo-1559963110-71b394e7494d?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=5GKZLY3b-SI",
    stepImages: [
      "https://images.unsplash.com/photo-1559963110-71b394e7494d?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeMiddle12: {
    imageUrl: "https://images.unsplash.com/photo-1601579112934-17ac2aa02b6a?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=DMoiiFKuZEU",
    stepImages: [
      "https://images.unsplash.com/photo-1601579112934-17ac2aa02b6a?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate01: {
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=C1664e9NVYs",
    stepImages: [
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate02: {
    imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=RX4ISHeKfzw",
    stepImages: [
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate03: {
    imageUrl: "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=5Fy3LLxUVeU",
    stepImages: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate04: {
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=GwxxXvxNXI0",
    stepImages: [
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate05: {
    imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=ew5O24pTrmo",
    stepImages: [
      "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate06: {
    imageUrl: "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=e-TL27l91JE",
    stepImages: [
      "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate07: {
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=deSjUaUoIrI",
    stepImages: [
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate08: {
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=Nu7KrZLPgs8",
    stepImages: [
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate09: {
    imageUrl: "https://images.unsplash.com/photo-1559963110-71b394e7494d?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=obs08KPAbfA",
    stepImages: [
      "https://images.unsplash.com/photo-1559963110-71b394e7494d?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate10: {
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=hGj-AZANXms",
    stepImages: [
      "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate11: {
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=fncsqai92ik",
    stepImages: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=220&fit=crop&q=80"
    ]
  },
  recipeLate12: {
    imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=280&fit=crop&crop=center&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=CYAvQvLSeDI",
    stepImages: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=220&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&h=220&fit=crop&q=80"
    ]
  }
};
