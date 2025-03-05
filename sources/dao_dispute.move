module AptosAI_LawGuard::DaoDispute {
    use std::signer;
    use std::vector;

    struct Dispute has key, store {
        dao_id: address,
        contract_id: address,
        initiator: address,
        status: vector<u8>,
    }

    struct DisputeStorage has key, store {
        removed_disputes: vector<Dispute>,
    }

    public entry fun initiate_dispute(
        initiator: &signer, dao_id: address, contract_id: address
    ) {
        let initiator_address = signer::address_of(initiator);
        let dispute = Dispute {
            dao_id: dao_id,
            contract_id: contract_id,
            initiator: initiator_address,
            status: b"Pending",
        };
        move_to(initiator, dispute);
    }

    public entry fun delete_dispute(dao: &signer, dao_id: address) acquires Dispute, DisputeStorage {
        let dao_address = signer::address_of(dao);
        assert!(dao_address == dao_id, 0);

        let storage = borrow_global_mut<DisputeStorage>(dao_address);
        let removed_dispute = move_from<Dispute>(dao_id);
        vector::push_back(&mut storage.removed_disputes, removed_dispute);
    }
}
