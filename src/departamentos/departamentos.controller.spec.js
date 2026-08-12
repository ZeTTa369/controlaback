"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const departamentos_controller_1 = require("./departamentos.controller");
describe('DepartamentosController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [departamentos_controller_1.DepartamentosController],
        }).compile();
        controller = module.get(departamentos_controller_1.DepartamentosController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=departamentos.controller.spec.js.map