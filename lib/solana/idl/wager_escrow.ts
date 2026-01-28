/**
 * IDL for Clash Royale Escrow Program
 * Generated from Anchor program
 * 
 * To regenerate: anchor build && anchor idl parse -f target/idl/clash_royale_escrow.json
 */

export type ClashRoyaleEscrow = {
  "version": "0.1.0",
  "name": "clash_royale_escrow",
  "instructions": [
    {
      "name": "createWager",
      "accounts": [
        {
          "name": "wager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "wagerId",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "joinWager",
      "accounts": [
        {
          "name": "wager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "opponent",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "resolveWager",
      "accounts": [
        {
          "name": "wager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "platformTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "backendAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "winnerPubkey",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Wager",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "opponent",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "amount",
            "type": "u64"
            },
          {
            "name": "status",
            "type": {
              "defined": "WagerStatus"
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "wagerId",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "WagerStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Created"
          },
          {
            "name": "Active"
          },
          {
            "name": "Resolved"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidWagerStatus",
      "msg": "Invalid wager status for this operation"
    },
    {
      "code": 6001,
      "name": "CannotJoinOwnWager",
      "msg": "Cannot join your own wager"
    },
    {
      "code": 6002,
      "name": "InvalidWinner",
      "msg": "Invalid winner"
    },
    {
      "code": 6003,
      "name": "WinnerMismatch",
      "msg": "Winner pubkey mismatch"
    },
    {
      "code": 6004,
      "name": "MathOverflow",
      "msg": "Math overflow"
    }
  ]
};

export const IDL: ClashRoyaleEscrow = {
  "version": "0.1.0",
  "name": "clash_royale_escrow",
  "instructions": [
    {
      "name": "createWager",
      "accounts": [
        {
          "name": "wager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "wagerId",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "joinWager",
      "accounts": [
        {
          "name": "wager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "opponent",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "resolveWager",
      "accounts": [
        {
          "name": "wager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "platformTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "backendAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "winnerPubkey",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Wager",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "opponent",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "WagerStatus"
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "wagerId",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "WagerStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Created"
          },
          {
            "name": "Active"
          },
          {
            "name": "Resolved"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidWagerStatus",
      "msg": "Invalid wager status for this operation"
    },
    {
      "code": 6001,
      "name": "CannotJoinOwnWager",
      "msg": "Cannot join your own wager"
    },
    {
      "code": 6002,
      "name": "InvalidWinner",
      "msg": "Invalid winner"
    },
    {
      "code": 6003,
      "name": "WinnerMismatch",
      "msg": "Winner pubkey mismatch"
    },
    {
      "code": 6004,
      "name": "MathOverflow",
      "msg": "Math overflow"
    }
  ]
};


