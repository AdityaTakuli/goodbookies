import { c as createServerRpc } from "./createServerRpc-BIw0_1DM.js";
import { l as createServerFn } from "./server-De920IXE.js";
import { a as assertPhoneAvailable } from "./phone.server-D66YsfzL.js";
import { o as objectType, s as stringType } from "./types-DeUvCBv7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./phone-DJVzxjRj.js";
import "./client.server-CQTuKCic.js";
import "./index-BlRNeFf7.js";
const checkPhoneAvailable_createServerFn_handler = createServerRpc({
  id: "356233ab538099e723566e80a761c0e3d7afe85c53224308bed9d35f74638f03",
  name: "checkPhoneAvailable",
  filename: "src/lib/auth.functions.ts"
}, (opts) => checkPhoneAvailable.__executeServer(opts));
const checkPhoneAvailable = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  phone: stringType().min(10).max(20)
}).parse(input)).handler(checkPhoneAvailable_createServerFn_handler, async ({
  data
}) => {
  const normalized = await assertPhoneAvailable(data.phone);
  return {
    ok: true,
    phone: normalized
  };
});
export {
  checkPhoneAvailable_createServerFn_handler
};
