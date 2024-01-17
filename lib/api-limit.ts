import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

import { MAX_FREE_COUNTS } from "@/constants";


// API利用制限を1増やす関数です。
export const incrementApiLimit = async () => {
  const { userId } = auth(); // 現在のユーザーIDを認証から取得します。

  if (!userId) {
    return; // ユーザーIDが取得できなければ処理を終了します。
  }

  // データベースからそのユーザーのAPI制限情報を取得します。
  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId: userId },
  });

  // すでに情報がある場合は、その回数を1増やします。
  if (userApiLimit) {
    await prismadb.userApiLimit.update({
      where: { userId: userId },
      data: { count: userApiLimit.count + 1 },
    });
  } else {
    // まだ情報がなければ、新規レコードを作成し、回数を1にします。
    await prismadb.userApiLimit.create({
      data: { userId: userId, count: 1 },
    });
  }
};

// API利用制限に達しているかを確認する関数です。
export const checkApiLimit = async () => {
  const { userId } = auth(); // 現在のユーザーIDを認証から取得します。

  if (!userId) {
    return false; // ユーザーIDが取得できなければfalseを返します。
  }

  // データベースからそのユーザーのAPI制限情報を取得します。
  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId: userId },
  });

  // 制限情報がないか、または制限回数にまだ達していなければtrueを返します。
  if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
    return true;
  } else {
    // 制限回数に達していればfalseを返します。
    return false;
  }
};

// 現在のAPI利用回数を取得する関数です。
export const getApiLimitCount = async () => {
  const { userId } = auth(); // 現在のユーザーIDを認証から取得します。

  if (!userId) {
    return 0; // ユーザーIDが取得できなければ0を返します。
  }

  // データベースからそのユーザーのAPI制限情報を取得します。
  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId
    }
  });

  // 制限情報がなければ0を、あれば現在の利用回数を返します。
  if (!userApiLimit) {
    return 0;
  }

  return userApiLimit.count;
};


