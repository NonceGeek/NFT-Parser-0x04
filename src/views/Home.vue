<template>
  <div class="home">
    <github-link/>
    <a-layout>
      <a-layout-header>
        <a-row class="project-name">NFT-Parser-0x04</a-row>
        <a-row class="project-description">基本款</a-row>
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
        <div  v-for="index in tokenUrisLength">
          <a-row
            v-if="showSlides"
            class="token-list"
            type="flex"
            justify="space-between"
            align="middle"
          >
            <h1>部落{{index}}</h1>
            <a-col :span="16" :offset="4">
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
                  v-for="pageIndex in Math.ceil(tokens[index-1].length /eachPageSlide)"
                  :key="pageIndex"
                >
                  <a-row>
                    <a-col
                      v-for="(token, index) in tokens[index-1]"
                      :key="((pageIndex - 1) * eachPageSlide) + index"
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
      // nftAddress: '0xB84DF36e58a31f98d6294420569c365e8e1acaCd',
      nftAddress: '0xA8f3d9AB71C54111E120F5c0b658d18E0c7B8018',
      tokens: [],
      tokenCount:0,
      pageCount:0,
      pagedTokens:[],
      sortedTokens:[],
      tokenUrisLength: null,
      eachPageSlide: 3,
      showSlides: false,
    };
  },
  computed: {
    // tokenCount() {
    //   return this.tokens.length;
    // },
    // pageCount() {
    //   return Math.ceil(this.tokenCount / this.eachPageSlide);
    // },
    // pagedTokens() {
    //   const arr = [];
    //   for (let i = 0; i < this.pageCount; i++) {
    //     arr.push(this.tokens.slice(i * this.eachPageSlide, (i + 1) * this.eachPageSlide));
    //   }
    //   return arr;
    // },
    searchEnabled() {
      return this.nftAddress.length > 0
    },
  },
  created() {
    this.checkNFTAddrInURL()

  },
  methods: {
    get1(){

    },
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
          const result = await this.asyncGetEvidenceByKey(evidenceKey+"#gene")
          getSpiritInfo(result['0']).then(res=>{
            this.tokens[i].evidence = res.data
            this.tokens[i].imgUri =res.data.img_num
          })
        }
        setTimeout(function(tokens){
          getSortArray(tokens).then(res=>{
            this.tokenUrisLength = res.data.data.length
            this.tokens = res.data.data;
            console.log(res.data.data);

          })
        }, 3000, this.tokens);

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
