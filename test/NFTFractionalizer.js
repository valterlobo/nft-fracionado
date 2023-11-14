const {
    time,
    loadFixture
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("TokenTemplate", function () {

    async function deployTokenTemplate() {

        const [owner, addr1, addr2] = await ethers.getSigners()

        const TokenTemplate = await ethers.getContractFactory(
            "TokenTemplate"
        )
        const token = await TokenTemplate.deploy()
        const nm = "TTESTE"
        const sb = "TK"
        const cap = ethers.parseUnits("1000", 18)
        //console.log("Deploying TokenTemplate...")
        await token.initialize(nm, sb, owner.address, cap)
        //console.log("TokenTemplate deployed to:", await token.getAddress())


        //Fractionalizer
        const Fractionalizer = await ethers.getContractFactory(
            "Fractionalizer"
        )
        const fractionalizer = await Fractionalizer.deploy()



        const NFTMock = await ethers.getContractFactory(
            "NFTMock"
        )
        const nftMock = await NFTMock.deploy()

        await nftMock.initialize(owner.address)


        //attach 
        const TokenFractionVault = await ethers.getContractFactory(
            "TokenFractionVault"
        )


        return {
            TokenTemplate, token, owner, addr1, addr2, nm, sb, cap, fractionalizer, nftMock, TokenFractionVault
        }

    }

    describe("Deployment", function () {

        it("Should set the right owner, name, symbol, cap, totalSupply(0)", async function () {

            const { TokenTemplate, token, owner, addr1, addr2, nm, sb, cap } = await loadFixture(deployTokenTemplate)
            expect(await token.owner()).to.equal(owner.address)
            expect(await token.cap()).to.equal(cap)
            expect(await token.name()).to.equal(nm)
            expect(await token.symbol()).to.equal(sb)
            //expect(await token.totalSupply()).to.equal(0)

        })

    })


    describe("Fractionalizer initialize", function () {

        it('Should initialize vault ', async function () {

            const { TokenTemplate, token, owner, addr1, addr2, nm, sb, cap, fractionalizer, nftMock, TokenFractionVault } = await loadFixture(deployTokenTemplate)


            await nftMock.safeMint(addr1.address, 1)

            const ownerOfNFT = await nftMock.ownerOf(1)

            console.log(ownerOfNFT)


            fractionalizer.on('Fractionalize', async (from, nft, tokenId, fractions) => {

                console.log("FRANCTION TK", fractions)

                const tkFraction = TokenFractionVault.attach(fractions)

                const fractionTK = await tkFraction.balanceOf(addr1.address)
                console.log("TK FRACTIONS", fractionTK)
                console.log("TK FRACTIONSx", await tkFraction.name(), await tkFraction.symbol(), await tkFraction.totalSupply())
                console.log("TK FRACTIONS S", await tkFraction.totalSupply())
                console.log("TK FRACTIONS C", await tkFraction.cap())

                const ownerOfNFT = await nftMock.ownerOf(tokenId)
                console.log("TK FRACTIONS OWNER ", ownerOfNFT)
                console.log("TK FRACTIONS TARGET", nft)
                console.log("TK FRACTIONS NFT   ", await nftMock.getAddress())



                const total = await tkFraction.balanceOf(addr1.address)
                console.log("ADDR1", total)
                await tkFraction.connect(addr1).transfer(addr2.address, total)


                const totalAddr1 = await tkFraction.balanceOf(addr1.address)

                console.log("TRF ADDR1", totalAddr1)

                const totalAddr2 = await tkFraction.balanceOf(addr2.address)

                console.log("TRF ADDR2", totalAddr2)

                try {
                    await tkFraction.connect(addr2).approve(await tkFraction.getAddress(), totalAddr2)
                    const txRedeem = await tkFraction.connect(addr2).redeem()
                    const ownerOfNFT2 = await nftMock.ownerOf(tokenId)
                    console.log("NFT OWNER ", ownerOfNFT2)
                    console.log("NFT OWNER ? ADDR2 ", addr2.address)

                    const totaltkAdd2 = await tkFraction.balanceOf(addr2.address)

                    console.log("TOTAL TOKEN ADDR2", totaltkAdd2)

                    console.log("TOTAL TOKEN TK VAULT", await tkFraction.balanceOf(await tkFraction.getAddress()))
                    //console.log("redeem", txRedeem)
                } catch (ex) {
                    console.log(ex)
                }





            })

            await nftMock.connect(addr1).approve(await fractionalizer.getAddress(), 1)
            const amount = ethers.parseUnits("1000", 18);
            const tkFractions = await fractionalizer.connect(addr1).fractionalize(await nftMock.getAddress(), 1, "TK INVOICE", "TKINV", amount)





            //await erc20_rw.estimateGas.transfer("ricmoo.eth", parseUnits("1.23"));

        })

    })



    describe("redeem", function () {

        it('Should redeem ', async function () {


        })

    })

})
