"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdificiosModule = void 0;
const common_1 = require("@nestjs/common");
const edificios_controller_1 = require("./edificios.controller");
const edificios_service_1 = require("./edificios.service");
@(0, common_1.Module)({
    controllers: [edificios_controller_1.EdificiosController],
    providers: [edificios_service_1.EdificiosService]
})
class EdificiosModule {
}
exports.EdificiosModule = EdificiosModule;
//# sourceMappingURL=edificios.module.js.map