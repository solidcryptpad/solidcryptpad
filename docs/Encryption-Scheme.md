# Keystores

A user can have multiple keystores stored on their pod. The purpose of a keystore is, to contain the encryption keys for the files it is responsible for (e.g. it can be a dictionary that maps urls to keys). Each keystore is encrypted with an unique key.

To keep track of all keystores of a user, the file `/solidcrypt-data/keystores/keystores.json.enc` contains a list of all keystores, the url at which they are stored, and the key which is used to encrypt them. This file is encrypted with the master password.

Initially, there is only the "root" keystore, which contains all encryption keys for the files on the own pod. After sharing links, it also contains shared keystores. These contain the keys for all shared files and can also reside on different pods (e.g. when opening a link from a friend, the keystore will be on their pod).

![keystores graph](https://www.plantuml.com/plantuml/png/fPCnQyCm48Lt_Og7zmnjjmnTIhEqfO7GAMHGVMSYAgHmfoI4al_UAX9rgC4GF1byxttt_0wR48dHhA9tz2IdNLfQQl1jWFKNdpH5OIZBmRMymMpsY7NdF8D3cyKkXduwnqxYmH4ZEz55mLwy6enuBiJdCc32ubUdcLIrvcmCsMG_hJAQXJWEf5Z66h7rSK_z-vSQMCiKMA-sLZ8sUcB1myO0PpCq_WkGxLbvlRrMDDZTMuVRNvqcs41NNrwgYLr-5dNjO5Zs71sdTjihRuU-7qCElBdLMOkhTKombzxl9XFk9nC6jn-vkJ5Lyw4ipULVUBEQMB2qgiSeD78quWiNVpFlD1Ng3m00)

# File Encryption

When a new file is created, a key is generated and stored in all keystores which contain this file (e.g. the root keystore for the own pod, or a shared keystore in a shared folder). The key is used to encrypt the file before it gets stored on the Solid Pod.

![file encryption diagram](https://www.plantuml.com/plantuml/png/XP71Rk8m48RlynIZx6LNYEsTGuLQjPUs4XBg0mps0ACwjcLF2Bnz7O98IMavGAIP___yMPvdfQHDxK157UEpbBydRz8XgWGFG4P3mlVC2M0LzbWjWnDd7xl0Wco5VrvbizK7rp34WX8ZaRmUGGDdoMadvZ9HlV1XKdvPG-9Je4BAE9gDiUSvUuj52S2Iqeeouo9O0EXaSNf_NG4d4vnXfXqZxwcEZl_hNW6kXWjbRDFtDwnt9Z4fumSVS1tI1MtSAPYYTgwMJhz79rdnho6pPViF4ckJF7AlmVQSozU8tJLx97lbX6-Kky-2Scv3ij-mTR-Ff_rDoHpPo5hCO7jR5234u_NG1yLrQBo5dmwQOHCjAG_yLdIBdjjk0i1TztHI6VpoH6KnmAS5t2PH7lGkteQCoewKlxOwz4ZlDcXU19lQVG80)

# File Decryption

When decrypting a file, all keystores are searched for the key. It takes the first key that is found and uses it to decrypt the file from the Solid pod.

![file decryption diagram](https://www.plantuml.com/plantuml/png/XP3VQkim38VlzHGYv-QCiZt0BaRPdzriWqBP0wYsqfevTf2LhNtx9KtCC4dfHKWY_VJfG-ka9Der7jIfPtnrdl6PZPnQTJ40aD4e-9bO07RnYDKsUkVjqn3OaAtmtxlR7_JHTmmjYJhZMWfw1hs4pDcoV3jJ9getFgtw9saKdW8LKiAoDiVcEWUBlHA09QKT9SPDj00moEBjmx82hbPuZy9aaO_Kj9xlzAW0Y-5CAMPhLdCeXgT8dkWjBYM5jPE0F2vYUwOlLoyhbGVAMdjM_E8Jrb6AbJay4ympKn-zIuh_3Pa3svkvKywb9U9myX79GLdmWzBmsb1AFr7i3DkC_NRgNvLCBHjNE_DdUrqqT_f_oDyc1kMW6ElYHciEjclyBm00)

# Sharing Links

There are two different aspects for sharing a resource. On the one hand, one has to grant permissions to access the file on the Solid pod (e.g. to allow GET and PUT requests). On the other hand, the encryption keys also have to be shared with the other user, so they are able to decrypt the resource.

![shareFile](https://www.plantuml.com/plantuml/png/RP11IyGm48Nl-HN32buM1VNcGHO5FRZWGdz1J6RROTEaJ2QxstzlKeXLsXuAUI_lcpVPHT4igNTAI1p2E-LVqsactogbZGI6huj7LkexN67J14VEll4uo47R3TpigUtarILKGmQHeK5xWJtvKw5WWtmcyz_yn75DFY3t52C5l-P-S4X3DT1Ro7LK_gPoSFUo60dRBJn3B0eSyrRtSXMb5hToilQfcHO5JZZ2CV2SP9J4lkZhaDflnXX6BGYilGqzjCMlbEdmyFYqYbe-HEb4P_oDWJO6OmG9Sx-ATXa85v9kMk7spwWTUfjwzmC0)

![openSharedFile](https://www.plantuml.com/plantuml/png/VP31JiCm38RlVWfhIDn00cuSqCIaNU0mgU81GkDsrjmuSjonlZsX7DYgYTmY-_l_BraN3-RZ8E3iGlXHEFLOzi4eOiT2A9mE0A5rDTmQKue0dth2LQF24ZSsPT-5kCART-xt_YeZGGxct78EoR7voThea3LHyelHbeKQiYEtbyWRJSNLhivsHaUchx_0AeJL1-hvrSExbqKfFkE19hp5tdJC3uzF08k5Yfp9rFqG8mvJ8UdGzJzkALlP-JetTchp9zxxoQ-noyTKE7B94gOpR4qfZeDy0m00)

## Granting permissions to the pod or what happens when sharing a link?

Let us assume there is a person called $`\textcolor{#a61e4d}{\text{owner}}`$ who would like to share their file `myCoolFile.txt`.
![myCoolFile.txt](./images/myCoolFile.png)

The mechanism is the same for all sharing types (read/write, file/folder). The idea is, to create a cryptographically random group in the form of `group-[randomKey].ttl`, which for illustrative purposes in our case will be `/groups/group-123randKeyUnguessable.ttl`.

Then we allow the public to read and append to this file.

> Read access is necessary since the server needs to check if somebody has the appropriate permissions for a resource

These permissions are set in the corresponding `group-123randKeyUnguessable.ttl.acl` file, which looks somewhat like this.

![group.ttl.acl](./images/groupAcl.png)

The $`\textcolor{#a61e4d}{\text{owner}}`$ has full control over the group file while newly added $`\textcolor{#1864ab}{\text{collaborators}}`$ can only read and append. At this point, the group is still just an empty file.

Then in our file's `.acl` file we need to give this group the desired permissions, so everyone who is a member of this group has the permissions we would like to grant our collaborators. Therefore, the `myCoolFile.txt.acl` looks somewhat like this:

![file.txt.acl](./images/myCoolFileAcl.png)

As expected, the $`\textcolor{#a61e4d}{\text{owner}}`$ still has all rights (given that it is their file!) whereas the members of the $`\textcolor{#1864ab}{\text{group}}`$ have been granted **read** and **write** access.

Finally, we need to retrieve the encryption key from our encrypted keystore to finalize the sharing link.
![keystore](./images/keystoreRoot.png)

Now let us say that $`\textcolor{#a61e4d}{\text{owner}}`$ shares their file `myCoolFile.txt` with their two collaborators $`\textcolor{#1864ab}{\text{otto}}`$ and $`\textcolor{#1864ab}{\text{halid}}`$. Then, upon opening the shared link which contains the secret group name, the collaborators add themselves to the group and our group file looks like this:

![group.ttl](./images/group.png)

After adding themself to the group, they have access to the resource. The final link is made up of several components depending on if it is for a **file** or a **folder**. A shared link for a fale consists of a $`\textcolor{#2b8a3e}{\text{file URL}}`$, a $`\textcolor{#862e9c}{\text{key}}`$ and the corresponding $`\textcolor{#e67700}{\text{group}}`$

> solidcryptp.ad/share?file=$`\textcolor{#2b8a3e}{\text{owner.solidweb.org/myCoolFile.txt}}`$
> &key=$`\textcolor{#862e9c}{\text{key123}}`$
> &group=$`\textcolor{#e67700}{\text{owner.solidweb.org/groups/group-123randKeyUnguessable.ttl}}`$

## Sharing encryption keys for files

The sharing link includes the encryption key for the file. This can be directly used to decrypt the file with the link.

## Sharing encryption keys for folders

Here we need to share keys for all files inside this folder (even those, which will be created in the future). This is done with a shared keystore for this folder.

When creating the link, the creator fetches all keys currently used in the folder and creates a new keystore with it. The keystore is encrypted with a new random key. The url to the key and the encryption key are added to the link. Both, the owner and the link receiver, add this keystore to their list of keystores.

Now, whenever a key for this folder is fetched, the keystore service will find the shared keystore and lookup the key there. When new files and keys are created, the keystore service also adds the key to the shared folder, so all users have access to the new file.
