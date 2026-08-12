"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const pagos_controller_1 = require("./pagos.controller");
describe('PagosController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [pagos_controller_1.PagosController],
        }).compile();
        controller = module.get(pagos_controller_1.PagosController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=pagos.controller.spec.js.map