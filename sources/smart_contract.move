module AptosAI_LawGuard::SmartContract {
    use std::signer;
    use std::vector;

    struct Contract has key, store, drop {
        creator: address,
        text: vector<u8>,
        risk_score: u8,
        risk_category: vector<u8>,
    }

    struct ContractStorage has key, store {
        contracts: vector<Contract>,
    }

    public entry fun create_contract(
        creator: &signer, text: vector<u8>, risk_score: u8, risk_category: vector<u8>
    ) acquires ContractStorage {
        let creator_address = signer::address_of(creator);
        if (!exists<ContractStorage>(creator_address)) {
            move_to(creator, ContractStorage { contracts: vector::empty() });
        };
        let storage = borrow_global_mut<ContractStorage>(creator_address);
        let contract = Contract {
            creator: creator_address,
            text,
            risk_score,
            risk_category,
        };
        vector::push_back(&mut storage.contracts, contract);
    }

    public entry fun delete_contract(creator: &signer) acquires ContractStorage {
        let creator_address = signer::address_of(creator);
        let storage = borrow_global_mut<ContractStorage>(creator_address);
        if (vector::length(&storage.contracts) > 0) {
            vector::pop_back(&mut storage.contracts);
        }
    }
}