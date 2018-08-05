
# MeowBox - Server

사랑한다면 **미유박스**하세요

## [ about ]

반려묘를 위한 필수 용품과 수제 간식을 정기 배송하는 서비스입니다.

반려묘를 키우기 위해 필수적으로 구매해야 하는 물품들이 있습니다. 미유박스는 그 중에 4가지(간식, 장난감, 용품, 스크래처)를 정기 배송해주는 서비스 입니다.

반려묘의 정보에 따른 박스구성이 배송됩니다. 

박스의 종류

- 정기박스
- 생일박스
- 초보자 박스(고양이를 처음 키우시는 고객을 위한 박스)



## [ WorkFlow ]

![workflow](https://github.com/ruddls00114/MeowBox-Server/blob/master/public_data/images/meowbox_workflow.jpg)







## [ System Architecture ]

![architecture](https://github.com/ruddls00114/MeowBox-Server/blob/master/public_data/images/SA.png)





## [ Features ]

- 결제 [Axios](https://github.com/axios/axios)

<img  width = "70%" height = "70%" src="https://github.com/TeamMeowBox/MeowBox-Server/blob/master/public_data/images/payment.png" />

- 트랜잭션 처리
- 로깅 [Winston](https://github.com/winstonjs/winston)
- 클러스터링
- 에러코드

<img  width = "70%" height = "70%" src="https://github.com/TeamMeowBox/MeowBox-Server/blob/master/public_data/images/status_error.png" />

- 스케쥴러


## [ 사용 모듈 ]

* [cors](https://github.com/expressjs/cors)

* [multer](https://github.com/expressjs/multer)

* [jwt](https://github.com/lcobucci/jwt)

* [helmet](https://github.com/helmetjs/helmet)

* [async/await](https://github.com/Anwesh43/aync-await-js)



## [ Function ]