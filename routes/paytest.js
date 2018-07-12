
const express = require('express');
const router = express.Router();

const {Iamporter, IamporterError} = require('iamporter')

const iamporter = new Iamporter({
    apiKey : '6141135946318499',
    secret : 'GLE2IBlYDgJLzGlSbC40lbCDbBbSDv9khOnZpIX3YGPxmbqyOuy9GbNRNYJquTLLH8L7RIbPp0nMbNk0'
})
// const iamport = new Iamport({
//     impKey: '6141135946318499',
//     impSecret: 'GLE2IBlYDgJLzGlSbC40lbCDbBbSDv9khOnZpIX3YGPxmbqyOuy9GbNRNYJquTLLH8L7RIbPp0nMbNk0'
// })
//***************************************************************************************//
// server 확인 의사코드
// imp_uid = extract_POST_value_from_url('imp_uid') //post ajax request로부터 imp_uid확인

// payment_result = rest_api_to_find_payment(imp_uid) //imp_uid로 아임포트로부터 결제정보 조회
// amount_to_be_paid = query_amount_to_be_paid(payment_result.merchant_uid) //결제되었어야 하는 금액 조회. 가맹점에서는 merchant_uid기준으로 관리

// IF payment_result.status == 'paid' AND payment_result.amount == amount_to_be_paid
// 	success_post_process(payment_result) //결제까지 성공적으로 완료
// ELSE IF payment_result.status == 'ready' AND payment.pay_method == 'vbank'
// 	vbank_number_assigned(payment_result) //가상계좌 발급성공
// ELSE
// 	fail_post_process(payment_result) //결제실패 처리

router.post('/',async (req,res,next) => {
    console.log(req.query)
    let {imp_uid,merchant_uid,imp_success} = req.query

    
    if(imp_success){
        //결제 성공
        iamporter.findByImpUid(imp_uid)
        .then(result => {
            console.log("result")
            return res.r(result)
        }).catch(err=>{
            console.log("err")
            return next(err)
        })
    } else {
        //결제 실패
        iamporter.cancelByImpUid(imp).then(result => {
            console.log("result")
            return res.r(result)
        })
        return next("400")
    }
})

module.exports = router