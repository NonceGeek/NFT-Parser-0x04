<template>
  <div class="token-card">
    <a-card :title="evidenceKey">
      <div class="nft-img">
        <img :src="require(`@/assets/spirits/${imgUri}.png`)">
<!--        <img :src="imgUri">-->
      </div>
      <div class="nft-extra">
        <span>性别：</span>
        <span>{{ extra.sex }}</span>
      </div>
      <div class="nft-extra">
        <span>攻击：</span>
        <span>{{ extra.攻击 }}</span>
      </div>
      <div class="nft-extra">
        <span>特攻：</span>
        <span>{{ extra.特攻 }}</span>
      </div>
      <div class="nft-extra">
        <span>特防：</span>
        <span>{{ extra.特防 }}</span>
      </div>
      <div class="nft-extra">
        <span>速度：</span>
        <span>{{ extra.速度 }}</span>
      </div>
      <div class="nft-extra">
        <span>防御：</span>
        <span>{{ extra.防御 }}</span>
      </div>
    </a-card>
  </div>
</template>

<script>
import * as dayjs from 'dayjs'

export default {
  name: 'TokenCard',
  props: {
    token: Object,
  },
  data() {
    return {
      evidenceKey: null,
      imgUri: null,
      extra: {
        sex: null,
        攻击: null,
        特攻: null,
        特防: null,
        速度: null,
        防御: null,
      },
    };
  },
  mounted() {
    this.normalize()
  },
  methods: {
    normalize() {
      this.evidenceKey = this.token.evidenceKey
      this.imgUri = this.token.imgUri
      if (!this.token.evidence) {
        this.extra = {
          sex: '暂无',
          攻击: '暂无',
          特攻: '暂无',
          特防: '暂无',
          速度: '暂无',
          防御: '暂无',
        }

        return
      }

      // console.log(this.token.evidence);
      // const intro = JSON.parse(this.token.evidence[0].replaceAll("'", '\"'))
      const intro = this.token.evidence
      this.extra = {
        sex: intro.sex || '暂无',
        攻击: intro.攻击 || '暂无',
        特攻: intro.特攻 || '暂无',
        特防: intro.特防 || '暂无',
        速度: intro.速度 || '暂无',
        防御: intro.防御 || '暂无',
      }
    },
  },
};
</script>

<style lang="scss">
.ant-card {
  //height: 50%;
  width: 90%;
}

.ant-card-head-title {
  white-space: normal !important;
  text-overflow: unset !important;
  overflow-wrap: anywhere;
}

.nft-img {
  padding-bottom: 100%;
  position: relative;

  img {
    position: absolute;
    top: 0;
    left: 0;
    max-width: 100%;
    max-height: 100%;
  }
}

.nft-extra {
  text-align: left;
  padding: 5px 0;
}
</style>
