"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const pagos_service_1 = require("./pagos.service");
describe('PagosService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [pagos_service_1.PagosService],
        }).compile();
        service = module.get(pagos_service_1.PagosService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=pagos.service.spec.js.map