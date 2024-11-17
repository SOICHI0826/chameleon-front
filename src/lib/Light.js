/* eslint-disable */
// Encapsulates common light functionality
export class Light {
  constructor(id) {
    this.id = id;
    this.position = [0, 0, 0];

    // We could use the OBJ convention here (e.g. Ka, Kd, Ks, etc.),
    // but decided to use more prescriptive terms here to showcase
    // both versions
    this.ambient = [0, 0, 0, 0];
    this.diffuse = [0, 0, 0, 0];
    this.specular = [0, 0, 0, 0];
  }

  // sliceメソッドは、開始位置から終了位置の直前の要素までを抽出した新しい配列を生成
  // 終了位置を明示しない場合、開始位置からすべての値が複製
  // Array.slice(0)で配列ごと複製（シャローコピーの回避）
  setPosition(position) {
    this.position = position.slice(0);
  }

  setDiffuse(diffuse) {
    this.diffuse = diffuse.slice(0);
  }

  setAmbient(ambient) {
    this.ambient = ambient.slice(0);
  }

  setSpecular(specular) {
    this.specular = specular.slice(0);
  }

  setProperty(property, value) {
    this[property] = value;
  }

}

// Helper class to maintain a collection of lights
export class LightsManager {

  constructor() {
    this.list = [];
  }

  add(light) {
    // オブジェクト instanceof 型
    // → オブジェクトが型通りであるか確認できる
    if (!(light instanceof Light)) {
      console.error('The parameter is not a light');
      return;
    }
    this.list.push(light);
  }

  getArray(type) {
    // reduceメソッドは、配列をループして各要素の値から単一の出力値を生成
    // ここでは、空の配列result[]に対して、配列の要素をconcatで結合していく
    // typeには、Lightオブジェクトの属性を入れる
    return this.list.reduce((result, light) => {
      result = result.concat(light[type]);
      return result;
    }, []);
  }

  get(index) {
    // light.idが引数indexと等しいLightオブジェクトをfindして返す
    if (typeof index === 'string') {
      return this.list.find(light => light.id === index);
    } else {
      return this.list[index];
    }
  }
}
