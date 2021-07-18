<template>
  <div class="home">
    <github-link/>
    <a-layout>
      <a-layout-header>
        <a-row class="project-name">NFT-Parser-0x04</a-row>
        <a-row class="project-description">基于NFT的电子宠物</a-row>
      </a-layout-header>
      <a-layout-content>
        <!-- 用户输入地址并显示 NFT -->
        <a-row type="flex" justify="space-between" align="middle">
          <a-col :span="16" :offset="4">
            <a-input-search
              v-model="nftAddress"
              size="large"
              allow-clear
              @search="fetchNFT"
            >
              <a-button
                slot="enterButton"
                type="primary"
                :disabled="!searchEnabled"
              >
                获取 NFT!
              </a-button>
            </a-input-search>
          </a-col>
        </a-row>
        <!-- 横向显示 NFT 列表 -->
        <div
          v-if="showSlides"
          class="nfts"
        >
          <a-row
            v-for="(outerTokenList, outerIndex) in tokenList"
            :key="outerIndex"
            class="token-list"
            type="flex"
            align="middle"
          >
            <h1 style="margin-left: 50px">部落{{ outerIndex + 1 }}</h1>
            <img style="width: 200px;height: 200px;margin-left: 40px" :src="/.(png|jpg|jpeg|gif)$/g.test(outerTokenList[0][0].tokenUri) ? outerTokenList[0][0].tokenUri : 'https://ftp.bmp.ovh/imgs/2021/07/32980b295c7e152a.png'" alt="">
            <a-col :span="16" :offset="1">
              <div style="border:1px dashed #000;">
                <div style="margin-top: 20px">
                  <a-carousel arrows>
                    <div
                      slot="prevArrow"
                      class="custom-slick-arrow"
                      style="left: 10px; zIndex: 1"
                    >
                      <a-icon type="left-circle" />
                    </div>
                    <div
                      slot="nextArrow"
                      class="custom-slick-arrow"
                      style="right: 10px"
                    >
                      <a-icon type="right-circle" />
                    </div>
                    <div
                      v-for="(middleTokenList, middleIndex) in outerTokenList"
                      :key="`${outerIndex}/${middleIndex}`"
                    >
                      <a-row>
                        <a-col
                          v-for="(token, innerIndex) in middleTokenList"
                          :key="`${outerIndex}/${middleIndex}/${innerIndex}`"
                          :span="24 / eachPageSlide"
                          class="token-card"
                        >
                          <token-card
                            :token="token"
                          />


                        </a-col>
                      </a-row>
                    </div>
                  </a-carousel>
                </div>

              </div>

            </a-col>
          </a-row>
        </div>
      </a-layout-content>
      <a-layout-footer></a-layout-footer>
    </a-layout>
  </div>
</template>

<script>
import {
  erc721Contract,
  erc721Address,
  chainId,
} from '@/web3/erc721Contract';
import {
  evidenceContract,
} from '@/web3/evidenceContract';
import TokenCard from '../components/TokenCard.vue';
import GithubLink from '@/components/GithubLink';
import { getSpiritInfo,getSortArray } from '@/network/home';

export default {
  name: 'Home',
  components: {
    GithubLink,
    TokenCard,
  },
  data() {
    return {
      nftAddress: '0xA8f3d9AB71C54111E120F5c0b658d18E0c7B8018',
      tokens: [],
      tokenList: [],
      eachPageSlide: 3,
      showSlides: false,
    };
  },
  computed: {
    searchEnabled() {
      return this.nftAddress.length > 0
    },
  },
  created() {
    this.checkNFTAddrInURL()

  },
  methods: {
    checkNFTAddrInURL() {
      if (this.$route.query.addr) {
        this.nftAddress = this.$route.query.addr
      }
    },
    async fetchNFT() {
      if (!this.searchEnabled) {
        return
      }
      this.showSlides = false
      this.tokens = []
      try {
        const tokenLength = await this.asyncBalanceOf(this.nftAddress)

        if (+tokenLength === 0) {
          this.infoOnZeroTokens()
          return
        }

        for (let i = 0; i < tokenLength; i++) {
          let tokenId = await this.asyncTokenOfOwnerByIndex(this.nftAddress, i)
          this.tokens.push({
            tokenId: parseInt(tokenId),
          })
        }

        for (let i = 0; i < this.tokens.length; i++) {
          const tokenUri = await this.asyncTokenURI(this.tokens[i].tokenId)
          this.tokens[i].tokenUri = tokenUri

          const evidenceKey = `${chainId}:${erc721Address}:${this.tokens[i].tokenId}`
          this.tokens[i].evidenceKey = evidenceKey

          const result = await this.asyncGetEvidenceByKey(evidenceKey + "#gene")
          const spiritInfo = await getSpiritInfo(result[0])

          this.tokens[i].evidence = spiritInfo.data
          this.tokens[i].imgUri = spiritInfo.data.img_num
        }

        const sortedArray = await getSortArray(this.tokens)
        this.tokens = sortedArray.data.data

        this.tokenList = []
        for (let i = 0; i < this.tokens.length; i++) {
          const pageCount = Math.ceil(this.tokens[i].length / this.eachPageSlide)
          this.tokenList.push([])

          for (let j = 0; j < pageCount; j++) {
            this.tokenList[i].push(this.tokens[i].slice(j * this.eachPageSlide, (j + 1) * this.eachPageSlide))
          }
        }

        this.showSlides = true

      } catch (error) {
        if (error.message.indexOf('invalid address') > -1) {
          this.errorOnInvalidNFTAddress()
        } else {
          console.log(error)
        }
      }
    },

    asyncBalanceOf(nftAddress) {
      return new Promise((resolve, reject) => {
        erc721Contract.methods.balanceOf(nftAddress).call((err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    },
    asyncTokenOfOwnerByIndex(nftAddress, tokenIndex) {
      return new Promise((resolve, reject) => {
        erc721Contract.methods.tokenOfOwnerByIndex(nftAddress, tokenIndex).call((err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    },
    asyncGetSpiritInfo(value){
      return new Promise((resolve, reject) => {
        getSpiritInfo(value).then((err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    },
    asyncTokenURI(tokenId) {
      return new Promise((resolve, reject) => {
        erc721Contract.methods.tokenURI(tokenId).call((err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    },
    asyncGetEvidenceByKey(evidenceKey) {
      return new Promise((resolve, reject) => {
        evidenceContract.methods.getEvidenceByKey(evidenceKey).call((err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    },
    infoOnZeroTokens() {
      this.$notification.info({
        message: '注意！',
        description: '该地址下没有 NFT 资源',
      })
    },
    errorOnInvalidNFTAddress() {
      this.$notification.error({
        message: '注意！',
        description: 'NFT 地址无效，请检查后重新查询',
      })
    }
  },
};
</script>

<style lang="scss">
.home {
  height: 100%;

  .ant-layout {
    background-color: inherit;

    .ant-layout-header {
      background: inherit;
      height: auto;

      .project-name {
        padding-top: 30px;
        text-align: center;
        font-size: 2em;
        font-weight: bolder;
      }

      .project-description {
        padding-bottom: 30px;
        text-align: center;
        font-size: 1.2em;
        font-weight: bold;
      }
    }

    .nfts {
      box-sizing: border-box;
      padding-left: 20px;
    }
    .token-list {
      margin-top: 50px;
    }
  }
}

.ant-carousel {

  .slick-slider {
    text-align: center;
    height: auto;
    overflow: hidden;

    .custom-slick-arrow {
      width: 25px;
      height: 25px;
      font-size: 25px;
      color: #000;
      opacity: 0.3;

      &:before {
        display: none;
      }

      &:hover {
        opacity: 0.5;
      }
    }
  }

  .slick-slide {
    padding: 0 40px;

    &.slick-active {
      margin-bottom: 20px;
    }

    .token-card {
      display: flex;
      justify-content: center;
    }
  }

  .slick-dots li button {
    background: #69c0ff !important;
  }

  .slick-dots li.slick-active button {
    background: #1890ff !important;
  }

  .slick-dots-bottom {
    bottom: 1px !important;
  }
}
</style>
