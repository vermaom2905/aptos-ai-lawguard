module AptosAI_LawGuard::ZkpAudit {
    use std::signer;
    use std::vector;
    
    struct AuditReport has key, store {
        contract_id: address,
        auditor: address,
        verified: bool,
        zkp_proof: vector<u8>,
    }

    struct AuditStorage has key, store {
        removed_audits: vector<AuditReport>,
    }

    public entry fun submit_audit(
        auditor: &signer, contract_id: address, verified: bool, zkp_proof: vector<u8>
    ) {
        let auditor_address = signer::address_of(auditor);
        assert!(vector::length(&zkp_proof) > 0, 0);

        let report = AuditReport {
            contract_id: contract_id,
            auditor: auditor_address,
            verified: verified,
            zkp_proof: zkp_proof,
        };

        move_to(auditor, report);
    }

    public entry fun remove_audit(auditor: &signer, contract_id: address) acquires AuditReport, AuditStorage {
        let auditor_address = signer::address_of(auditor);

        let storage = borrow_global_mut<AuditStorage>(auditor_address);
        let removed_audit = move_from<AuditReport>(contract_id);
        vector::push_back(&mut storage.removed_audits, removed_audit);
    }
}
