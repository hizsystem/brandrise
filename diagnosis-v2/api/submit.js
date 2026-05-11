/**
 * 모수 v2 트리거 진단서 — 응답 수집 API
 *
 * Body schema:
 *   { type: 'diagnosis-v2', code, scores, c1, c2, stage, team, email, company, timestamp }
 *
 * Slack 메시지: 코드(별명 매핑) + 6영역 점수 + C1·C2 인용 + 단계·팀 (TG 자연 이탈 라벨 포함)
 */

// 코드 → 별명 매핑 (워크샵 v1 시드 / 2026-05-11, specs/2026-05-11-workshop-output-v1-draft.md 1순위)
const CODE_NICKNAMES = {
  FS: '무대뽐내는 1인극',
  FG: '그래프 평행선 컴퍼니',
  TS: '검증 못하는 위임자',
  TG: '다음 한 뼘 미아',
};

const AREA_LABELS = {
  B1: '브랜드 일관성',
  B2: '데이터·대시보드',
  B3: '콘텐츠 체계',
  B4: '고객 이해',
  B5: 'AI·자동화',
  B6: '실행 속도',
};

const C1_LABELS = {
  inflow: '신규 고객 유입',
  roas: '광고 ROAS',
  content: '콘텐츠 반응·전환',
  data: '데이터·시스템',
  verify: '마케터 검증',
  next: '다음 단계 방향',
};

const STAGE_LABELS = {
  'seed': '시드 이전',
  'pre-a': '프리A',
  'series-a-plus': '시리즈A+',
  'non-vc': '비투자',
};

const TEAM_LABELS = {
  '0': '대표 직접',
  '1-2': '1~2명',
  '3+': '3명 이상',
  'outsource': '외주 운영',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    if (!data.code || !data.scores || !data.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      const code = data.code;
      const nickname = CODE_NICKNAMES[code] || code;
      const isTGRisk = code === 'TG' || data.stage === 'series-a-plus' || data.team === '3+';
      const isGoldenTS = code === 'TS';
      const total = Object.values(data.scores).reduce((a, b) => a + b, 0);

      const scoreDetail = Object.entries(data.scores)
        .map(([k, v]) => `  ${AREA_LABELS[k] || k}: ${'●'.repeat(v)}${'○'.repeat(4 - v)} ${v}/4`)
        .join('\n');

      const c1Text = (data.c1 || '').split(',').filter(Boolean).map(id => C1_LABELS[id] || id).join(', ') || '미선택';

      const headerEmoji = isGoldenTS ? '🟢' : isTGRisk ? '🟡' : '📊';
      const headerSuffix = isGoldenTS
        ? ' · ★ TS형 골든 타겟'
        : isTGRisk
          ? ' · TG형 자연 이탈 안내 대상'
          : '';

      const message = {
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `${headerEmoji} v2 새 진단 — ${code}${headerSuffix}` }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*코드*\n${code}` },
              { type: 'mrkdwn', text: `*별명*\n${nickname}` },
              { type: 'mrkdwn', text: `*회사*\n${data.company || '-'}` },
              { type: 'mrkdwn', text: `*이메일*\n${data.email}` },
              { type: 'mrkdwn', text: `*단계*\n${STAGE_LABELS[data.stage] || data.stage}` },
              { type: 'mrkdwn', text: `*마케팅 인력*\n${TEAM_LABELS[data.team] || data.team}` }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*점수: ${total}/24*\n\`\`\`\n${scoreDetail}\n\`\`\``
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*시급 과제 (C1):* ${c1Text}\n*대표의 한 줄 (C2):*\n> ${data.c2 || '-'}`
            }
          },
          { type: 'divider' },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: `⏰ ${new Date(data.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}` }
            ]
          }
        ]
      };

      await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Submit v2 error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
