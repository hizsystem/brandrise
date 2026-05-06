export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Validate required fields
    if (!data.company || !data.email || !data.scores) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send Slack notification
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      const scoreLabels = ['브랜드', '성과추적', '콘텐츠', '고객이해', '성장병목', '실행속도'];
      const scoreDetail = data.scores
        .map((s, i) => `  ${scoreLabels[i]}: ${'●'.repeat(s)}${'○'.repeat(4 - s)} ${s}/4`)
        .join('\n');

      const q7Labels = {
        branding: '브랜딩 정립',
        content: '콘텐츠 체계화',
        ads: '광고 시작·최적화',
        conversion: '매출 전환 개선'
      };
      const q7Text = (data.q7 || []).map(id => q7Labels[id] || id).join(', ') || '미선택';

      const message = {
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: '📊 새 진단 유입!' }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*회사*\n${data.company}` },
              { type: 'mrkdwn', text: `*대표*\n${data.name}` },
              { type: 'mrkdwn', text: `*이메일*\n${data.email}` },
              { type: 'mrkdwn', text: `*연락처*\n${data.phone || '-'}` },
              { type: 'mrkdwn', text: `*업종*\n${data.industry}` },
              { type: 'mrkdwn', text: `*단계*\n${data.stage}` }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*점수: ${data.totalScore}/24 (${data.grade}등급)*\n\`\`\`\n${scoreDetail}\n\`\`\`\n*가장 약한 영역:* ${data.weakest}\n*시급 과제:* ${q7Text}`
            }
          },
          {
            type: 'divider'
          },
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
    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
