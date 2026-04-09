// Diagnostic endpoint — remove once working
import { probeSoap, rawSoap } from "@/lib/soap-client";

export async function GET() {
  const ws_cid    = process.env.SOAP_CID!;
  const ws_passwd = process.env.SOAP_PASSWD!;

  const accountXml = await rawSoap("wsc_account_info", { ws_cid, ws_passwd });

  const results: Record<string, unknown> = {
    wsc_account_info_raw: accountXml,
    wsc_account_info:  await probeSoap("wsc_account_info",  { ws_cid, ws_passwd }),
    wsc_request_items: await probeSoap("wsc_request_items", { ws_cid, ws_passwd }),
    wsp_request_items: await probeSoap("wsp_request_items", { ws_pid: ws_cid, ws_passwd }),
  };

  return Response.json(results);
}
