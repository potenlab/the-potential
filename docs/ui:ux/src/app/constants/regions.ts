// 지역 거점 구조
export const REGION_GROUPS = [
  { 
    id: 'seoul', 
    label: '서울권', 
    hubs: [
      { id: 'gangnam', label: '강남/역삼' },
      { id: 'seongsu', label: '성수/건대' },
      { id: 'hongdae', label: '홍대/합정' },
      { id: 'yeouido', label: '여의도/마포' },
    ]
  },
  { 
    id: 'gyeonggi', 
    label: '경기권', 
    hubs: [
      { id: 'pangyo', label: '판교/분당' },
      { id: 'ilsan', label: '일산/고양' },
      { id: 'suwon', label: '수원/광교' },
      { id: 'namyangju', label: '남양주/구리' },
    ]
  },
  { 
    id: 'regional', 
    label: '지방권', 
    hubs: [
      { id: 'busan', label: '부산/경남' },
      { id: 'daegu', label: '대구/경북' },
      { id: 'daejeon', label: '대전/세종' },
      { id: 'gwangju', label: '광주/전라' },
      { id: 'gangwon', label: '강원/제주' },
    ]
  },
];

// Helper function to get hub label by ID
export function getHubLabel(hubId: string): string {
  for (const group of REGION_GROUPS) {
    const hub = group.hubs.find(h => h.id === hubId);
    if (hub) return hub.label;
  }
  return '';
}

// Helper function to get region group by hub ID
export function getRegionGroupByHub(hubId: string): string {
  for (const group of REGION_GROUPS) {
    if (group.hubs.some(h => h.id === hubId)) {
      return group.id;
    }
  }
  return '';
}
