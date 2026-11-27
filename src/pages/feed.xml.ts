// Keep the original /feed.xml URL alive for existing subscribers; same content as /post/rss.xml.
import type { APIContext, APIRoute } from "astro";
import { GET as blogFeed } from "starlight-blog/routes/rss";

export const GET: APIRoute = ({ locals, site }) =>
    blogFeed({ locals, site, params: { prefix: "post" } } as unknown as APIContext);
