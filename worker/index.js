// Handles form submissions; everything else falls through to the static assets.
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        if (url.pathname !== '/api/intake') return env.ASSETS.fetch(request);
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

        let body;
        try {
            body = await request.json();
        } catch {
            return Response.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const fullName = String(body.fullName ?? '').trim().slice(0, 200);
        const email = String(body.email ?? '').trim().slice(0, 320);
        const phone = String(body.phone ?? '').replace(/\D/g, '');
        const involvement = Array.isArray(body.involvement)
            ? body.involvement.map(String).slice(0, 10)
            : [];

        if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length !== 10 || !involvement.length) {
            return Response.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        await env.DB.prepare('INSERT INTO intake (full_name, email, phone, involvement) VALUES (?, ?, ?, ?)')
            .bind(fullName, email, phone, JSON.stringify(involvement))
            .run();

        // Row is saved; a failed email shouldn't fail the submission, so send in the background.
        ctx.waitUntil(
            env.EMAIL.send({
                to: { email, name: fullName },
                from: { email: 'welcome@intake.citizens4ontario.org', name: 'Citizens 4 Ontario' },
                subject: 'Thanks for joining Citizens 4 Ontario',
                text: `Hi ${fullName.split(' ')[0]},\n\nThanks for your interest in Citizens 4 Ontario! We'll reach out soon.\n\n— Citizens 4 Ontario`,
            }).catch(err => console.error('Email send failed', err.code, err.message))
        );

        return Response.json({ ok: true }, { status: 201 });
    },
};
